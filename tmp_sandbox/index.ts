// used as reference: https://github.com/AztecProtocol/aztec-crypto-js/blob/master/bn128/bn128.js

import { getMaxListeners } from "process";
import { BindingName } from "typescript";

const BN = require("bn.js");
const EC = require("elliptic");
const crypto = require("crypto");

const GRUMPKIN_PARAMS = {
    a: "0",
    b: "3",
    fieldModulus: new BN(
        "21888242871839275222246405745257275088696311157297823662689037894645226208583",
        10
    ),
    groupModulus: new BN(
        "21888242871839275222246405745257275088548364400416034343698204186575808495617",
        10
    ),
    generator: ["1", "2"],
};

const grumpkin = {
    curve: new EC.curve.short({
        a: GRUMPKIN_PARAMS.a,
        b: GRUMPKIN_PARAMS.b,
        p: GRUMPKIN_PARAMS.fieldModulus.toString(16),
        n: GRUMPKIN_PARAMS.groupModulus.toString(16),
        gRed: false,
        g: GRUMPKIN_PARAMS.generator,
    }),
    groupReduction: BN.red(GRUMPKIN_PARAMS.groupModulus),
};

function initTreasury() {
    const secretKey = new BN(crypto.randomBytes(32), 16).toRed(
        grumpkin.groupReduction
    );
    const gx = grumpkin.curve.g.getX().toRed(grumpkin.groupReduction);
    const gy = grumpkin.curve.g.getY();

    // console.log(grumpkin.curve.red);
    console.log(grumpkin.groupReduction);
    console.log(gx.toString(16));

    // const testSecret = new BN(3).toRed(grumpkin.groupReduction);
    // console.log(testSecret);

    // const pubKey = gx.redMul(testSecret);

    // console.log(pubKey.toString(16));
}

initTreasury();
