const BN = require("bn.js");
const EC = require("elliptic");
const crypto = require("crypto");

interface Deposit {
    // ρ * G
    P: any;

    // ρ * managerPk
    Q: InstanceType<typeof BN>;

    // amount of ETH
    v: InstanceType<typeof BN>;
}

const curve = new EC.ec("curve25519");

// CREATE TREASURY
const manager = curve.genKeyPair();
const managerPriv = manager.getPrivate();
const managerPub = manager.getPublic();
console.log("Manager publishes pk:", managerPub.getX().toString(16));

// DEPOSIT
const contributor = curve.genKeyPair();
const dep: Deposit = {
    P: contributor.getPublic(),
    Q: contributor.derive(managerPub),
    v: 123,
};
console.log("Contributor sends in a deposit:", [
    dep.P.getX().toString(16),
    dep.Q.toString(16),
    dep.v,
]);

// WITHDRAW
const recoverShared = manager.derive(dep.P);
console.log(
    "Manager recovers Q using P & priv key:",
    recoverShared.toString(16)
);
