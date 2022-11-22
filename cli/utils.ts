/*
 * Utility functions for cli.
 */

import { BigNumber } from "bignumber.js";
import { Bytes32 } from "soltypes";
import { ethers } from "ethers";

import { Deposit } from "./types";
const { Point } = require("./node_modules/babyjubjub/lib/Point.js");
const { PublicKey, PrivateKey } = require("babyjubjub");

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

    static stringifyDeposit(dep: Deposit) {
        return {
            P: [dep.P.x.n.toString(16), dep.P.y.n.toString(16)],
            Q: [dep.Q.x.n.toString(16), dep.Q.y.n.toString(16)],
            V: dep.v.toString(),
        }
    }

    /*
     * [TODO]
     */  
    static castSolDeposit(solDep: any): Deposit {
        if (!solDep) throw new Error("Tried to cast a null Solidity deposit.")
        return {
            P: Utils.hexStringPairToPoint(Utils.parseGetterPoint(solDep.P)),
            Q: Utils.hexStringPairToPoint(Utils.parseGetterPoint(solDep.Q)),
            v: solDep["v"],
        };
    }
}
