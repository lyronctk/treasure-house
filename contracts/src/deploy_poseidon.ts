/*
 * Deploy bytecode for poseidon hash w/ t = 3, 6. The former will be used to 
 * process left-right hashes for the merkle tree and the latter will be used to 
 * hash (P.x, P.y, Q.x, Q.y, v) deposits
 */

// @ts-ignore
import { poseidonContract } from "circomlibjs";
import { ethers } from "ethers";

import dotenv from "dotenv";
dotenv.config({path: "../../cli/.env"});

const signer: ethers.Wallet = new ethers.Wallet(
    <string>process.env.MANAGER_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);

const C3: ethers.ContractFactory = new ethers.ContractFactory(
    poseidonContract.generateABI(2),
    poseidonContract.createCode(2),
    signer
);
const C6: ethers.ContractFactory = new ethers.ContractFactory(
    poseidonContract.generateABI(5),
    poseidonContract.createCode(5),
    signer
);

async function logInfo(deployed: ethers.Contract, lbl: string) {
    console.log(`== Deployed ${lbl}`);
    console.log(`- tx hash: ${deployed.deployTransaction.hash}`);
    console.log(`- deployed to: ${deployed.address}`);
    console.log('==');
}

console.log(JSON.stringify(poseidonContract.generateABI(2), null, 4));

// (async () => {
//     const deployedC3 = await C3.deploy();
//     const deployedC6 = await C6.deploy();

//     logInfo(deployedC3, "C3");
//     logInfo(deployedC6, "C6");
// })();
