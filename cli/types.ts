import { ethers } from "ethers";
import { Bytes32 } from "soltypes";

const { Point } = require("./node_modules/babyjubjub/lib/Point.js");

export type Deposit = {
    P: InstanceType<typeof Point>;
    Q: InstanceType<typeof Point>;
    v: ethers.BigNumber;
};

export type SolPoint = {
    x: Bytes32;
    y: Bytes32;
};

export type Groth16Proof = {
    pi_a: [string, string, string],
    pi_b: [[string, string], [string, string], [string, string]],
    pi_c: [string, string, string],
    protocol: string,
    curve: string
};

export type Groth16ProofCalldata = {
    a: [string, string],
    b: [[string, string], [string, string]],
    c: [string, string],
    input: string[]
}

export type WithdrawPubSignals = [string, string, string, string];
