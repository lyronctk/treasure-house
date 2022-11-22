/*
 * Creates a new private treasury by 1) generating a babyjubjub keypair for
 * the manager and 2) posting the public key with a label on the contract's
 * directory. Contributors will use the treasury's public key for deposits. 
 * Managers will use the treasury's private key to perform balance checks and
 * withdrawals. 
 */

import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";

import Utils from './utils';

const TREASURY_LABEL: string = "test";
const ADD_NEW_TREASURY: boolean = false;

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
 * Enumerates all treasury info stored in the contract.
 */
async function enumerateDirectory() {
    const dirLen = await privateTreasury.getDirectoryLength();
    console.log(
        `== Current directory before adding new treasury (len = ${dirLen})`
    );
    for (var i = 0; i < dirLen.toNumber(); i++) {
        const entry = await privateTreasury.directory(i);
        console.log(entry["label"], ":", Utils.parseGetterPoint(entry["pk"]));
    }
    console.log("==");
}

/*
 * Generates a new keypair. Private key must be stored for later use by the
 * manager. Public key & a succinct label posted on-chain for contributors
 * to access.
 */
async function createTreasury() {
    const [managerPriv, managerPub] = Utils.genJubKP();
    console.log("== Sending tx to create treasury");
    const res = await privateTreasury.create(
        {
            x: Utils.bigNumToBytes32(managerPub.p.x.n).toString(),
            y: Utils.bigNumToBytes32(managerPub.p.y.n).toString(),
        },
        TREASURY_LABEL
    );
    console.log("Response:", res);
    console.log("==");
}

(async () => {
    await enumerateDirectory();
    if (ADD_NEW_TREASURY) {
        await createTreasury();
    }
})();
