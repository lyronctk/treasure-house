/*
 * [TODO]
 */

import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import fs from "fs";

const snarkjs = require("snarkjs");

import { Deposit, groth16Proof, withdrawPubSignals } from "./types";
import Utils from "./utils";

const DEP_IDX: Number = 0;
const PROV_KEY: string = "../circuits/verif-manager.zkey";
const VERIF_KEY: string = "../circuits/verif-manager.vkey.json";
const WASM: string = "../circuits/verif-manager.wasm";
const DO_PROVE_SANITY_CHECK: boolean = true;

const signer = new ethers.Wallet(
    <string>process.env.MANAGER_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
const privateTreasury = new ethers.Contract(
    <string>process.env.CONTRACT_ADDR,
    require(<string>process.env.CONTRACT_ABI_PATH).abi,
    signer
);

/*
 * [TODO]
 */
async function getDepInfo(depIdx: Number): Promise<Deposit> {
    console.log("== Retrieving deposit at index", depIdx);
    const solDep = await privateTreasury.deposits(depIdx);
    const dep: Deposit = {
        P: Utils.hexStringPairToPoint(Utils.parseGetterPoint(solDep["P"])),
        Q: Utils.hexStringPairToPoint(Utils.parseGetterPoint(solDep["Q"])),
        v: solDep["v"],
    };
    console.log({
        P: [dep.P.x.n.toString(16), dep.P.y.n.toString(16)],
        Q: [dep.Q.x.n.toString(16), dep.Q.y.n.toString(16)],
        V: dep.v.toString(),
    });
    console.log("==");
    return dep;
}

function buildProofArgs(proof: any) {
    return [
        proof.pi_a.slice(0, 2), // pi_a
        // genZKSnarkProof reverses values in the inner arrays of pi_b
        [proof.pi_b[0].slice(0).reverse(), 
        proof.pi_b[1].slice(0).reverse()],
        proof.pi_c.slice(0, 2), // pi_c
    ];
}

/*
 * [TODO]
 */
async function genProof(
    dep: Deposit
): Promise<[groth16Proof, withdrawPubSignals]> {
    console.log("== Generating proof");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
            P: [dep.P.x.n.toString(10), dep.P.y.n.toString(10)],
            Q: [dep.Q.x.n.toString(10), dep.Q.y.n.toString(10)],
            managerPriv: process.env.TREASURY_PRIVKEY,
        },
        WASM,
        PROV_KEY
    );
    console.log("Proof (circom):", proof);
    console.log("Proof (for contract call):", buildProofArgs(proof));
    console.log("Public signals:", publicSignals);
    console.log("==");
    return [proof, publicSignals];
}

/*
 * [TODO]
 */
async function proveSanityCheck(
    prf: groth16Proof,
    pubSigs: withdrawPubSignals
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

async function sendProofTx(prf: groth16Proof, pubSigs: withdrawPubSignals) {
    console.log("== Sending tx with withdrawal proof");
    const res = await privateTreasury.withdraw(
        0,
        pubSigs,
        ...buildProofArgs(prf),
    );
    console.log(res);
    console.log("==");
}

(async () => {
    const dep = await getDepInfo(DEP_IDX);
    const [proof, publicSignals] = await genProof(dep);
    if (DO_PROVE_SANITY_CHECK) await proveSanityCheck(proof, publicSignals);
    // await sendProofTx(proof, publicSignals);
})();
