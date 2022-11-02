import dotenv from "dotenv";
dotenv.config();

import { BN } from "bn.js";
import { Bytes32 } from "soltypes";
import { assert } from "console";

const { PublicKey, PrivateKey } = require("babyjubjub");
const { Point } = require("./node_modules/babyjubjub/lib/Point.js");

interface Deposit {
    // ρ * G
    P: InstanceType<typeof Point>;

    // ρ * treasuryPk
    Q: InstanceType<typeof Point>;

    // amount of ETH
    v: InstanceType<typeof BN>;
}

type SolPoint = {
    x: Bytes32;
    y: Bytes32;
};

const TREASURY_PUB: SolPoint = {
    x: new Bytes32(
        "0x1a3474df0b1783e9e82202a451db4d1ec63bd55f135a7703bf559291e0b4f718"
    ),
    y: new Bytes32(
        "0x088b879f3ff87e39d5a59a4e8785fe7d61429afc052b7578a38c6d7a98baebea"
    ),
};
const DO_WITHDRAW_SANITY_CHECK: boolean = true;

const treasuryPub: InstanceType<typeof PublicKey> = new PublicKey(
    new Point(TREASURY_PUB.x.toUint().val, TREASURY_PUB.y.toUint().val)
);
const contributorPriv: InstanceType<typeof PrivateKey> = new PrivateKey(
    PrivateKey.getRandObj().field
);
const contributorPub: InstanceType<typeof Point> =
    PublicKey.fromPrivate(contributorPriv);

const sharedKey: InstanceType<typeof Point> = treasuryPub.p.mult(
    contributorPriv.s
);
const dep: Deposit = {
    P: contributorPub.p,
    Q: sharedKey,
    v: new BN(123),
};
console.log("== deposit(), contributor sends in a deposit");
console.log({
    P: [dep.P.x.n.toString(10), dep.P.y.n.toString(10)],
    Q: [dep.Q.x.n.toString(10), dep.Q.y.n.toString(10)],
    V: dep.v.toString(10),
});
console.log("==\n");

if (DO_WITHDRAW_SANITY_CHECK) {
    console.log("== Sanity check");
    const treasuryPriv: InstanceType<typeof PrivateKey> = new PrivateKey(
        process.env.TREASURY_PRIVKEY
    );
    const derivedQ = dep.P.mult(treasuryPriv.s);
    console.log("Derived Q via treasury private key:", [
        derivedQ.x.n.toString(10),
        derivedQ.y.n.toString(10),
    ]);
    console.log("Equal to deposit's Q?", derivedQ.isEqualTo(dep.Q));
    console.log("==");
}
