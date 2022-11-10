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

/*
 * [TODO]
 */
async function genProof(dep: Deposit): Promise<[any, withdrawPubSignals]> {
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
    console.log("Success");
    console.log("==");
    return [proof, publicSignals];
}

/*
 * [TODO]
 */
async function proveSanityCheck(prf: any, pubSigs: withdrawPubSignals) {
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
 * [TODO]
 */
async function sendProofTx(prf: groth16Proof, pubSigs: withdrawPubSignals) {
    console.log("== Sending tx with withdrawal proof");
    console.log(
        "Manager balance BEFORE:",
        ethers.utils.formatEther(await signer.getBalance())
    );
    const formattedProof = await exportCallDataGroth16(prf, pubSigs);
    console.log("Proof:", formattedProof);
    const result = await privateTreasury.withdraw(
        0,
        formattedProof.a,
        formattedProof.b,
        formattedProof.c,
        formattedProof.input
    );
    console.log(result);
    console.log(
        "Manager balance AFTER:",
        ethers.utils.formatEther(await signer.getBalance())
    );
    console.log("==");
}

/*
 * [TODO]. Inspired by https://github.com/vplasencia/zkSudoku/blob/main/contracts/test/utils/utils.js
 */
async function exportCallDataGroth16(
    prf: groth16Proof,
    pubSigs: withdrawPubSignals
) {
    const proofCalldata: string = await snarkjs.groth16.exportSolidityCallData(
        prf,
        pubSigs
    );
    const argv: string[] = proofCalldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x: string) => BigInt(x).toString());
    return {
        a: argv.slice(0, 2),
        b: [argv.slice(2, 4), argv.slice(4, 6)],
        c: argv.slice(6, 8),
        input: argv.slice(8),
    };
}

(async () => {
    const dep = await getDepInfo(DEP_IDX);
    const [proof, publicSignals] = await genProof(dep);
    if (DO_PROVE_SANITY_CHECK) await proveSanityCheck(proof, publicSignals);
    await sendProofTx(proof, publicSignals);
})();
