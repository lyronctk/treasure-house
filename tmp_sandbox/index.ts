const BN = require("bn.js");
const EC = require("elliptic");

const crypto = require("crypto");
const fs = require("fs");
const snarkjs = require("snarkjs");

const WASM: string = "../circuits/verif-manager.wasm";
const PROV_KEY: string = "../circuits/verif-manager.zkey";
const VERIF_KEY: string = "../circuits/verif-manager.vkey.json";

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

(async () => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { G: 5, privKey: 3, pubKey: 15 },
        WASM,
        PROV_KEY
    );

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    const vKey = JSON.parse(fs.readFileSync(VERIF_KEY));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
})().then(() => process.exit(0));
