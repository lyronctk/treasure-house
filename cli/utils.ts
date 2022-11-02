import { BigNumber } from "bignumber.js";
import { Bytes32 } from "soltypes";
import { ethers } from "ethers";

const { PublicKey, PrivateKey } = require("babyjubjub");

export default class Utils {
    static parseGetterPoint(p: any) {
        return [p["x"], p["y"]];
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
}
