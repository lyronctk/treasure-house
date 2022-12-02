/*
 * Withdraws a deposit by posting a ZK proof for knowing a witness α s.t.
 * P * α = G. The value of the leaf will be sent in ether to the sender's
 * (manager's) account.
 */

import dotenv from "dotenv";
dotenv.config();

// @ts-ignore
import { buildPoseidon } from "circomlibjs";
import { ethers } from "ethers";
import fs from "fs";
// @ts-ignore
import { groth16 } from "snarkjs";
import { NOTHING_UP_MY_SLEEVE, IncrementalQuinTree } from "maci-crypto";
// @ts-ignore
import { PrivateKey } from "babyjubjub";

import {
    Groth16Proof,
    Groth16ProofCalldata,
    WithdrawPubSignals,
} from "./types";
import Leaf from "./Leaf";
import Utils from "./utils";

const LEAF_IDX: number = 1;
const DO_PROVE_SANITY_CHECK: boolean = true;

const TREE_DEPTH = 32;

const PROV_KEY: string = "../circuits/verif-manager.zkey";
const VERIF_KEY: string = "../circuits/verif-manager.vkey.json";
const WASM: string = "../circuits/verif-manager.wasm";

const signer: ethers.Wallet = new ethers.Wallet(
    <string>process.env.MANAGER_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
const privateTreasury: ethers.Contract = new ethers.Contract(
    <string>process.env.CONTRACT_ADDR,
    require(<string>process.env.CONTRACT_ABI_PATH).abi,
    signer
);

/*
 * Queries contract for all leaves ever stored. Uses emitted NewLeaf event.
 * Hashes leaves using poseidon hash.
 */
async function getDepositHistory(poseidon: any): Promise<[Leaf[], BigInt[]]> {
    console.log("== Fetching deposit history");
    const newLeafEvents: ethers.Event[] = await privateTreasury.queryFilter(
        privateTreasury.filters.NewLeaf()
    );
    const leafHistory: Leaf[] = newLeafEvents.map((e) =>
        Leaf.fromSol(e.args?.lf)
    );
    const leafHashes: BigInt[] = leafHistory.map((lf) =>
        lf.poseidonHash(poseidon)
    );
    console.log(`- Retrieved ${leafHashes.length} leaves`);
    console.log("==");
    return [leafHistory, leafHashes];
}

/*
 * Finds indices of owned leaves, i.e. the treasury private key at hand
 * satisfies P * α = G
 */
function checkLeafOwnership(leafHistory: Leaf[]): number[] {
    console.log("== Checking leaves for ownership");
    const owned: number[] = leafHistory.reduce(
        (a: number[], lf: Leaf, i: number) => {
            const isOwned: boolean = lf.checkQDerivation(
                new PrivateKey(process.env.TREASURY_PRIVKEY)
            );
            if (isOwned) a.push(i);
            return a;
        },
        []
    );
    console.log(`- Found ${owned.length} leaves recoverable by the privKey.`);
    console.log("==");
    return owned;
}

/*
 * Retrieves a leaf from deposits Merkle Tree.
 */
async function getLeafInfo(leafIdx: Number): Promise<Leaf> {
    console.log("== Retrieving leaf at index", leafIdx);
    const solLeaf = await privateTreasury.deposits(leafIdx);
    const leaf: Leaf = Leaf.fromSol(solLeaf);
    console.log(leaf);
    console.log("==");
    return leaf;
}

/*
 * Generates proof w/ public signals P & Q to demonstrate knowledge of the
 * manager's / treasury's private key.
 */
async function genProof(lf: Leaf): Promise<[Groth16Proof, WithdrawPubSignals]> {
    console.log("== Generating proof");
    const { proof, publicSignals } = await groth16.fullProve(
        {
            P: lf.getPBase10(),
            Q: lf.getQBase10(),
            managerPriv: process.env.TREASURY_PRIVKEY,
        },
        WASM,
        PROV_KEY
    );
    console.log("Success");
    console.log("==");
    return [proof, publicSignals];
}

/*
 * Ensures proof verifies client-side with snarkjs before posting on-chain.
 */
async function proveSanityCheck(
    prf: Groth16Proof,
    pubSigs: WithdrawPubSignals
) {
    console.log("== Running sanity check, verifying proof client-side");
    const vKey = JSON.parse(fs.readFileSync(VERIF_KEY, "utf8"));
    const res = await groth16.verify(vKey, pubSigs, prf);
    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
    console.log("==");
}

/*
 * Posts the ZK proof on-chain and logs the increase in the manager's
 * balance. Need the 60s timeout call for non-local blockchains that don't have
 * instant finality.
 */
async function sendProofTx(prf: Groth16Proof, pubSigs: WithdrawPubSignals) {
    console.log("== Sending tx with withdrawal proof");
    console.log(
        "Manager balance BEFORE:",
        ethers.utils.formatEther(await signer.getBalance())
    );
    const formattedProof: Groth16ProofCalldata =
        await Utils.exportCallDataGroth16(prf, pubSigs);
    console.log("Proof:", formattedProof);
    const result = await privateTreasury.withdraw(
        LEAF_IDX,
        formattedProof.a,
        formattedProof.b,
        formattedProof.c,
        formattedProof.input
    );
    console.log(result);
    // await new Promise(resolve => setTimeout(resolve, 60000));
    console.log(
        "Manager balance AFTER:",
        ethers.utils.formatEther(await signer.getBalance())
    );
    console.log("==");
}

/*
 * Reconstructs Merkle tree of deposits client side for inclusion proof
 * generation.
 */
async function reconstructMerkleTree(
    leafHashes: BigInt[]
): Promise<IncrementalQuinTree> {
    console.log("== Reconstructing Merkle tree");
    let tree: IncrementalQuinTree = new IncrementalQuinTree(
        TREE_DEPTH,
        NOTHING_UP_MY_SLEEVE,
        2
    );
    leafHashes.forEach((lh: BigInt) => {
        tree.insert(lh);
    });
    console.log("- Root:", tree.root);
    console.log(
        "- Same as root stored on contract?",
        tree.root === BigInt(await privateTreasury.root())
    );
    console.log("==");
    return tree;
}

(async () => {
    const poseidon = await buildPoseidon();
    const [leafHistory, leafHashes] = await getDepositHistory(poseidon);
    const ownedLeaves = checkLeafOwnership(leafHistory);
    const tree = await reconstructMerkleTree(leafHashes);
    const merkleProof = tree.genMerklePath(ownedLeaves[LEAF_IDX]);
    console.log(merkleProof);
})();

// (async () => {
//     const lf = await getLeafInfo(LEAF_IDX);
//     const [proof, publicSignals] = await genProof(lf);
//     if (DO_PROVE_SANITY_CHECK) await proveSanityCheck(proof, publicSignals);
//     await sendProofTx(proof, publicSignals);
// })();
