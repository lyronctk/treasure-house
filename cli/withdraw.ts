/*
 * Withdraws a deposit by posting a ZK proof for knowing a witness α s.t.
 * P * α = G. The value of the leaf will be sent in ether to the sender's
 * (manager's) account.
 */

import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import fs from "fs";

const snarkjs = require("snarkjs");

import {
    Groth16Proof,
    WithdrawPubSignals,
} from "./types";
import Leaf from "./Leaf";
import Utils from "./utils";

const LEAF_IDX: Number = 0;
const DO_PROVE_SANITY_CHECK: boolean = true;

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
 */  
async function getDepositHistory(): Promise<Leaf[]> {
    const newLeafEvents: ethers.Event[] = await privateTreasury.queryFilter(
        privateTreasury.filters.NewLeaf()
    );
    return newLeafEvents.map((e) => Leaf.fromSol(e.args?.lf));
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
async function genProof(
    lf: Leaf
): Promise<[Groth16Proof, WithdrawPubSignals]> {
    console.log("== Generating proof");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
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
    const res = await snarkjs.groth16.verify(vKey, pubSigs, prf);
    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
    console.log("==");
}

/*
 * Posts the ZK proof on-chain and logs the increase in the manager's
 * balance. Need the 60s call for non-local blockchains that don't have instant
 * finality.
 */
async function sendProofTx(prf: Groth16Proof, pubSigs: WithdrawPubSignals) {
    console.log("== Sending tx with withdrawal proof");
    console.log(
        "Manager balance BEFORE:",
        ethers.utils.formatEther(await signer.getBalance())
    );
    const formattedProof = await Utils.exportCallDataGroth16(prf, pubSigs);
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

(async () => {
    const depHistory = await getDepositHistory();
    console.log(depHistory);
})();

(async () => {
    const lf = await getLeafInfo(LEAF_IDX);
    const [proof, publicSignals] = await genProof(lf);
    if (DO_PROVE_SANITY_CHECK) await proveSanityCheck(proof, publicSignals);
    await sendProofTx(proof, publicSignals);
})();
1