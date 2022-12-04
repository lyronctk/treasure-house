/*
 * Utility functions for cli.
 */

import { BigNumber } from "bignumber.js";
import { Bytes32 } from "soltypes";
import { ethers } from "ethers";

const { Point } = require("./node_modules/babyjubjub/lib/Point.js");
const { PublicKey, PrivateKey } = require("babyjubjub");
const snarkjs = require("snarkjs");

import {
    Groth16Proof,
    Groth16ProofCalldata,
    WithdrawPubSignals,
} from "./types";

export default class Utils {
    /*
     * Generates and logs a babyjubjub keypair.
     */
    static genJubKP(): [
        InstanceType<typeof PrivateKey>,
        InstanceType<typeof PublicKey>
    ] {
        console.log("== Generating new keypair");
        const priv: InstanceType<typeof PrivateKey> = new PrivateKey(
            PrivateKey.getRandObj().field
        );
        const pub: InstanceType<typeof PublicKey> = PublicKey.fromPrivate(priv);
        console.log("Private key:", [priv.s.n.toString(10)]);
        console.log("Public key:", [
            pub.p.x.n.toString(10),
            pub.p.y.n.toString(10),
        ]);
        console.log("==");
        return [priv, pub];
    }

    /*
     * Converts a BigNumber to Bytes32 by turning into a hex string first.
     * Intermediate step is important to pad 0's on the left of the hex
     * representation of n until it is exactly 32 bytes.
     */
    static bigNumToBytes32(n: InstanceType<typeof BigNumber>): Bytes32 {
        return new Bytes32(
            ethers.utils.hexZeroPad(
                ethers.BigNumber.from(n.toString(10)).toHexString(),
                32
            )
        );
    }

    /*
     * Point, when retrieved via the contract's getter, comes with extra
     * metadata. Only need (x, y).
     */
    static parseGetterPoint(p: any): [string, string] {
        return [p["x"], p["y"]];
    }

    /*
     * Converts a pair of hexstrings that represent a point into the Point
     * datatype.
     */
    static hexStringPairToPoint(
        p: [string, string]
    ): InstanceType<typeof Point> {
        return new Point(
            new Bytes32(p[0]).toUint().val,
            new Bytes32(p[1]).toUint().val
        );
    }

    /*
     * Formats a proof into what is expected by the solidity verifier.
     * Inspired by https://github.com/vplasencia/zkSudoku/blob/main/contracts/test/utils/utils.js
     */
    static async exportCallDataGroth16(
        prf: Groth16Proof,
        pubSigs: WithdrawPubSignals
    ): Promise<Groth16ProofCalldata> {
        const proofCalldata: string =
            await snarkjs.groth16.exportSolidityCallData(prf, pubSigs);
        const argv: string[] = proofCalldata
            .replace(/["[\]\s]/g, "")
            .split(",")
            .map((x: string) => BigInt(x).toString());
        return {
            a: argv.slice(0, 2) as [string, string],
            b: [
                argv.slice(2, 4) as [string, string],
                argv.slice(4, 6) as [string, string],
            ],
            c: argv.slice(6, 8) as [string, string],
            input: argv.slice(8),
        };
    }

    /*
     * Circuits only work with fixed-length inputs, so the arrays must be
     * padded until they are of length MaxWithdraw. Padding done by copying the
     * first leaf. Note: This means the same leaf index will be passed into 
     * withdraw multiple times- must handle this well. 
     */
    static padCircuitInputs(
        nMaxWithdraw: number,
        leafIndices: number[],
        leavesBase10: { P: string[]; Q: string[]; v: string }[],
        inclusionProofs: any[]
    ): [{ P: string[]; Q: string[]; v: string }[], any[], number[]] {
        if (leafIndices.length > nMaxWithdraw)
            throw Error("Number of target leaves must be <= N_MAX_WITHDRAW.");
        if (leafIndices.length === 0)
            throw Error("Must attempt to withdraw at least one leaf.");
        const nPad: number = nMaxWithdraw - leavesBase10.length;
        leavesBase10 = leavesBase10.concat(Array(nPad).fill(leavesBase10[0]));
        inclusionProofs = inclusionProofs.concat(Array(nPad).fill(inclusionProofs[0]));
        leafIndices = leafIndices.concat(Array(nPad).fill(leafIndices[0]));
        return [leavesBase10, inclusionProofs, leafIndices];
    }
}
