/*
 * Creates a new private treasury by 1) generating a babyjubjub keypair for 
 * the manager and 2) posting the public key with a label on the contract's 
 * directory. Also contains utility func for getting an overview of the 
 * directory. 
 */

import dotenv from "dotenv";
dotenv.config();

import { BN } from "bn.js";
import { Bytes32 } from "soltypes";
import { ethers } from "ethers";
const { PublicKey, PrivateKey } = require("babyjubjub");

const CONTRACT_ADDR: string = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const CONTRACT_ABI =
    require("../contracts/out/PrivateTreasury.sol/PrivateTreasury.json").abi;
const TREASURY_LABEL: string = "test";
const ADD_NEW_TREASURY: boolean = false;

const signer = new ethers.Wallet(
    <string>process.env.MANAGER_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
const privateTreasury = new ethers.Contract(
    CONTRACT_ADDR,
    CONTRACT_ABI,
    signer
);

/*
 * Converts a BigNumber to Bytes32 by turning into a hex string first. 
 * Intermediate step is important to pad 0's on the left of the hex 
 * representation of n until it is exactly 32 bytes. 
 */
function bigNumToBytes32(n: InstanceType<typeof BN>): Bytes32 {
    return new Bytes32(
        ethers.utils.hexZeroPad(
            ethers.BigNumber.from(n.toString(10)).toHexString(),
            32
        )
    );
}

/*
 * Enumerates treasury info stored in the contract's directory. 
 */
async function enumerateDirectory() {
    const dirLen = await privateTreasury.getDirectoryLength();
    console.log(
        `== Current directory before adding new treasury (len = ${dirLen})`
    );
    for (var i = 0; i < dirLen.toNumber(); i++) {
        const entry = await privateTreasury.directory(i);
        console.log(entry["label"], ":", [entry["pk"]["x"], entry["pk"]["y"]]);
    }
    console.log("==");
}

/*
 * Generates a new keypair. Private key must be stored for later use by the 
 * manager. Public key & a succinct label posted on-chain for contributors 
 * to access. 
 */
async function createTreasury() {
    const managerPriv = new PrivateKey(PrivateKey.getRandObj().field);
    const managerPub = PublicKey.fromPrivate(managerPriv);

    console.log("== Sending tx to create treasury");
    console.log("Manager's priv:", [
        managerPriv.s.n.toString(10),
    ]);
    console.log("Manager's pub:", [
        managerPub.p.x.n.toString(10),
        managerPub.p.y.n.toString(10),
    ]);
    const res = await privateTreasury.create(
        bigNumToBytes32(managerPub.p.x.n).toString(),
        bigNumToBytes32(managerPub.p.y.n).toString(),
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
