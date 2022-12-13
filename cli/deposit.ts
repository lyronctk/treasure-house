/*
 * Contributes to a treasury by 1) generating a temporary Babyjubjub keypair for
 * the contributors, 2) computing P & Q values such that the leaf that can be
 * redeemed by the treasury's manager, 3) adding the element to the contract's
 * deposits merkle tree. Discrete log protects any observers from identifying
 * which treasury Q corresponds to.
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

const TREASURY_PUB: SolPoint = {
    x: new Bytes32(<string>process.env.TREASURY_PUB_X),
    y: new Bytes32(<string>process.env.TREASURY_PUB_Y),
};
const DEPOSIT_AMOUNT_ETH = "10";
const N_DEPOSITS = 3;

const DO_WITHDRAW_SANITY_CHECK: boolean = true;
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
 * Creates a leaf and sends it to the specified private treasury. Enable
 * the sanity check with the flag DO_WITHDRAW_SANITY_CHECK to ensure the
 * leaf is constructed correctly.
 */
async function depositToTreasury() {
    const [contributorPriv, contributorPub] = Utils.genJubKP();
    const lf: Leaf = Leaf.fromKeys(
        treasuryPub,
        contributorPriv,
        contributorPub,
        ethers.utils.parseEther(DEPOSIT_AMOUNT_ETH)
    );
    if (DO_WITHDRAW_SANITY_CHECK) {
        console.log(
            "- Can derive Q?",
            lf.checkQDerivation(new PrivateKey(process.env.TREASURY_PRIVKEY))
        );
    }
    if (ADD_NEW_LEAF) await sendLeaf(lf);
}

(async () => {
    for (let i = 0; i < N_DEPOSITS; i++)
        await depositToTreasury();
})();
