import { ethers } from "ethers";
import { Bytes32 } from "soltypes";

export type SolPoint = {
    x: Bytes32;
    y: Bytes32;
};

export type SolPointStr = {
    x: string;
    y: string;
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
