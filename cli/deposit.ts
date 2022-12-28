/*
 * Contributes to a treasury by 1) generating a nonce (babyjubjub base field 
 * element and corresponding scalar field element) for, 2) computing P & Q 
 * values such that the leaf that can be redeemed by the treasury's manager, 
 * 3) adding the leaf to the contract's deposits merkle tree. Hardness of 
 * discrete-log protects the leaf from withdrawal by anyone other than the 
 * manager. Anonymity of Q follows from the decisional diffie-hellman 
 * assumption.
 */

import dotenv from "dotenv";
dotenv.config();

import { Bytes32 } from "soltypes";
import { ethers } from "ethers";

const { Point } = require("./node_modules/babyjubjub/lib/Point.js");
const { PublicKey, PrivateKey } = require("babyjubjub");

import Leaf from "./Leaf";
import Utils from "./utils";
import { SolPoint } from "./types";

// Public key of the target treasury 
const TREASURY_PUB: SolPoint = {
    x: new Bytes32(<string>process.env.TREASURY_PUB_X),
    y: new Bytes32(<string>process.env.TREASURY_PUB_Y),
};

// How much ETH to send with each deposit 
const DEPOSIT_AMOUNT_ETH = "0.1";

// Number of deposits to make
const N_DEPOSITS = 3;

// Can toggle whether or not to post the tx that sends the leaf 
const ADD_NEW_LEAF: boolean = true;

const signer = new ethers.Wallet(
    <string>process.env.CONTRIBUTOR1_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
const privateTreasury = new ethers.Contract(
    <string>process.env.CONTRACT_ADDR,
    require(<string>process.env.CONTRACT_ABI_PATH).abi,
    signer
);

const treasuryPub: InstanceType<typeof PublicKey> = new PublicKey(
    new Point(TREASURY_PUB.x.toUint().val, TREASURY_PUB.y.toUint().val)
);

/*
 * Sends the leaf and accompanying Ether to the contract.
 */
async function sendLeaf(lf: Leaf) {
    console.log("== Sending tx with the leaf");
    const res = await privateTreasury.deposit(...lf.exportCallData(), {
        value: ethers.utils.parseEther(DEPOSIT_AMOUNT_ETH),
    });
    console.log("Response:", res);
    console.log("==");
}

/*
 * Creates a leaf and sends it to the specified private treasury. Also conducts
 * a sanity check to ensure the leaf is constructed correctly (funds won't be
 * lost).
 */
async function depositToTreasury() {
    const [noncePriv, noncePub] = Utils.genJubKP();
    const lf: Leaf = Leaf.fromKeys(
        treasuryPub,
        noncePriv,
        noncePub,
        ethers.utils.parseEther(DEPOSIT_AMOUNT_ETH)
    );
    console.log(
        "- Can derive Q?",
        lf.checkQDerivation(new PrivateKey(process.env.TREASURY_PRIVKEY))
    );
    if (ADD_NEW_LEAF) await sendLeaf(lf);
}

(async () => {
    for (let i = 0; i < N_DEPOSITS; i++)
        await depositToTreasury();
})();
