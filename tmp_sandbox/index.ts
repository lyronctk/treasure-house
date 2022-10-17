const BN = require("bn.js");
const EC = require("elliptic");

const crypto = require("crypto");
const fs = require("fs");
const snarkjs = require("snarkjs");

const { PublicKey, PrivateKey, Point } = require("babyjubjub");

const WASM: string = "../circuits/verif-manager.wasm";
const PROV_KEY: string = "../circuits/verif-manager.zkey";
const VERIF_KEY: string = "../circuits/verif-manager.vkey.json";

interface Deposit {
    // ρ * G
    P: InstanceType<typeof Point>;

    // ρ * managerPk
    Q: InstanceType<typeof Point>;

    // amount of ETH
    v: InstanceType<typeof BN>;
}

function sampleFlow() {
    // CREATE TREASURY
    const managerPriv = new PrivateKey(PrivateKey.getRandObj().field);
    const managerPub = PublicKey.fromPrivate(managerPriv);
    console.log("== Manager publishes pk");
    console.log(managerPub.p.x.n.toString(16), managerPub.p.y.n.toString(16));
    console.log("==\n");

    // DEPOSIT
    const contributorPriv = new PrivateKey(PrivateKey.getRandObj().field);
    const contributorPub = PublicKey.fromPrivate(contributorPriv);
    const sharedKey = managerPub.p.mult(contributorPriv.s);
    const dep: Deposit = {
        P: contributorPub.p,
        Q: sharedKey,
        v: 123,
    };
    console.log("== Contributor sends in a deposit");
    console.log({
        "P": [dep.P.x.n.toString(16), dep.P.y.n.toString(16)],
        "Q": [dep.Q.x.n.toString(16), dep.Q.y.n.toString(16)],
        "V": dep.v
    })
    console.log("==\n");
    
    // WITHDRAW
    const recoverShared = dep.P.mult(managerPriv.s);
    console.log("== Manager recovers Q using P & privKey");
    console.log(
        recoverShared.x.n.toString(16),
        recoverShared.y.n.toString(16)
    );
    console.log("==\n");

    // LOG ALL INFO
    console.log("== Manager");
    console.log(" - privKey:", managerPriv.s.n.toString(16));
    console.log(
        " - pubKey:",
        managerPub.p.x.n.toString(16),
        managerPub.p.y.n.toString(16)
    );
    console.log("==");
    console.log("== Contributor");
    console.log(" - privKey:", contributorPriv.s.n.toString(16));
    console.log(
        " - pubKey:",
        contributorPub.p.x.n.toString(16),
        contributorPub.p.y.n.toString(16)
    );
    console.log("==");
    console.log("== Shared");
    console.log(
        " - value:",
        sharedKey.x.n.toString(16),
        sharedKey.y.n.toString(16)
    );
    console.log("==");
}

sampleFlow();

// (async () => {
//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//         { G: 5, privKey: 3, pubKey: 15 },
//         WASM,
//         PROV_KEY
//     );

//     console.log("Proof: ");
//     console.log(JSON.stringify(proof, null, 1));

//     const vKey = JSON.parse(fs.readFileSync(VERIF_KEY));
//     const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
//     if (res === true) {
//         console.log("Verification OK");
//     } else {
//         console.log("Invalid proof");
//     }
// })().then(() => process.exit(0));
