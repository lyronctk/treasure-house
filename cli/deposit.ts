/*
 * Contributes to a treasury by 1) generating a temporary Babyjubjub keypair for
 * the contributors, 2) computing P & Q values such that the deposit that can be
 * redeemed by the treasury's manager, 3) adding the element to the contract's
 * deposits array. Discrete log protects any observers from identifying which
 * treasury Q corresponds to.
 */
import dotenv from "dotenv";
dotenv.config();

import { Bytes32 } from "soltypes";
import { ethers } from "ethers";

const { PublicKey, PrivateKey } = require("babyjubjub");
const { Point } = require("./node_modules/babyjubjub/lib/Point.js");

import Utils from "./utils";
import { Deposit, SolPoint } from "./types";

const TREASURY_PUB: SolPoint = {
    x: new Bytes32(
        "0x1a3474df0b1783e9e82202a451db4d1ec63bd55f135a7703bf559291e0b4f718"
    ),
    y: new Bytes32(
        "0x088b879f3ff87e39d5a59a4e8785fe7d61429afc052b7578a38c6d7a98baebea"
    ),
};
const DEPOSIT_AMOUNT_ETH = "0.1";

const DO_WITHDRAW_SANITY_CHECK: boolean = false;
const ADD_NEW_DEPOSIT: boolean = false;

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
 * A sanity check to ensure that the manager, who holds the treasury's private
 * key (α), is able to redeem the deposit by satisfying the constraint
 * P * α = G.
 */
function verifyQDerivation(dep: Deposit) {
    console.log("== Sanity check");
    const treasuryPriv: InstanceType<typeof PrivateKey> = new PrivateKey(
        process.env.TREASURY_PRIVKEY
    );
    const derivedQ: InstanceType<typeof Point> = dep.P.mult(treasuryPriv.s);
    console.log("Derived Q via treasury private key:", [
        derivedQ.x.n.toString(10),
        derivedQ.y.n.toString(10),
    ]);
    console.log("Equal to deposit's Q?", derivedQ.isEqualTo(dep.Q));
    console.log("==");
}

/*
 * Enumerates all deposit info stored in the contract.
 */
async function enumerateDeposits() {
    const nDeps = await privateTreasury.getNumDeposits();
    console.log(`== Current deposits before adding new (len = ${nDeps})`);
    for (var i = 0; i < nDeps.toNumber(); i++) {
        const d = await privateTreasury.deposits(i);
        console.log(i, ":", {
            P: Utils.parseGetterPoint(d["P"]),
            Q: Utils.parseGetterPoint(d["Q"]),
            v: d["v"].toString(),
        });
    }
    console.log("==");
}

/*
 * Constructs a deposit (P, Q, v), where P is the contributor's public key,
 * Q is a "shared secret" that can only be derived by the manager's public key
 * with P, and v is the amount of Ether to contribute (specified in wei).
 */
function constructDeposit(
    contributorPriv: InstanceType<typeof PrivateKey>,
    contributorPub: InstanceType<typeof PublicKey>
): Deposit {
    console.log("== Constructing deposit");
    const dep: Deposit = {
        P: contributorPub.p,
        Q: treasuryPub.p.mult(contributorPriv.s),
        v: ethers.utils.parseEther(DEPOSIT_AMOUNT_ETH),
    };
    console.log({
        P: [dep.P.x.n.toString(10), dep.P.y.n.toString(10)],
        Q: [dep.Q.x.n.toString(10), dep.Q.y.n.toString(10)],
        v: dep.v.toString(),
    });
    console.log("==");
    return dep;
}

/*
 * Sends the deposit element and accompanying Ether to the contract.
 */
async function sendDeposit(dep: Deposit) {
    console.log("== Sending tx with the deposit");
    const res = await privateTreasury.deposit(
        {
            x: Utils.bigNumToBytes32(dep.P.x.n).toString(),
            y: Utils.bigNumToBytes32(dep.P.y.n).toString(),
        },
        {
            x: Utils.bigNumToBytes32(dep.Q.x.n).toString(),
            y: Utils.bigNumToBytes32(dep.Q.y.n).toString(),
        },
        {
            value: dep.v,
        }
    );
    console.log("Response:", res);
    console.log("==");
}

/*
 * Creates a deposit and sends it to the specified private treasury. Enable
 * the sanity check with the flag DO_WITHDRAW_SANITY_CHECK to ensure the
 * deposit is constructed correctly.
 */
async function depositToTreasury() {
    const [contributorPriv, contributorPub] = Utils.genJubKP();
    const dep: Deposit = constructDeposit(contributorPriv, contributorPub);
    if (DO_WITHDRAW_SANITY_CHECK) verifyQDerivation(dep);
    if (ADD_NEW_DEPOSIT) await sendDeposit(dep);
}

(async () => {
    await enumerateDeposits();
    await depositToTreasury();
})();
