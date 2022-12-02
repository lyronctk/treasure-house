import { ethers } from "ethers";

const { Point } = require("./node_modules/babyjubjub/lib/Point.js");
const { PublicKey, PrivateKey } = require("babyjubjub");

import { SolPointStr } from "./types";
import Utils from "./utils";

export default class Leaf {
    // Contributor's public key
    P: InstanceType<typeof Point>;

    // Shared secret
    Q: InstanceType<typeof Point>;

    // Amount of Ether to contribute, denominated in wei
    v: ethers.BigNumber;

    constructor(
        P: InstanceType<typeof Point>,
        Q: InstanceType<typeof Point>,
        v: ethers.BigNumber
    ) {
        this.P = P;
        this.Q = Q;
        this.v = v;
    }

    /*
     * Access P with (x, y) as base10 strings.
     */
    getPBase10() {
        return [this.P.x.n.toString(10), this.P.y.n.toString(10)];
    }

    /*
     * Access Q with (x, y) as base10 strings.
     */
    getQBase10() {
        return [this.Q.x.n.toString(10), this.Q.y.n.toString(10)];
    }

    /*
     * Creates a leaf by computing Q from the contributor's keys and the
     * manager's public key.
     */
    static fromKeys(
        treasuryPub: InstanceType<typeof PublicKey>,
        contributorPriv: InstanceType<typeof PrivateKey>,
        contributorPub: InstanceType<typeof PublicKey>,
        v: ethers.BigNumber
    ): Leaf {
        return new Leaf(
            contributorPub.p,
            treasuryPub.p.mult(contributorPriv.s),
            v
        );
    }

    /*
     * Creates a leaf from the payload stored in the contract's events.
     */
    static fromSol(solLeaf: any): Leaf {
        if (!solLeaf) throw new Error("Tried to cast a null Solidity leaf.");
        return new Leaf(
            Utils.hexStringPairToPoint(Utils.parseGetterPoint(solLeaf.P)),
            Utils.hexStringPairToPoint(Utils.parseGetterPoint(solLeaf.Q)),
            solLeaf["v"]
        );
    }

    /*
     * Checks whether the manager, who holds the treasury's private key (α), is
     * able to redeem the leaf by satisfying the constraint P * α = G.
     */
    checkQDerivation(treasuryPriv: InstanceType<typeof PrivateKey>): boolean {
        const derivedQ: InstanceType<typeof Point> = this.P.mult(
            treasuryPriv.s
        );
        return derivedQ.isEqualTo(this.Q);
    }

    /*
     * Object with every property as its hex string representation, except
     * for v, which is kept in base10.
     */
    hexify(): { P: string[]; Q: string[]; v: string } {
        return {
            P: [
                "0x" + <string>this.P.x.n.toString(16),
                "0x" + <string>this.P.y.n.toString(16),
            ],
            Q: [
                "0x" + <string>this.Q.x.n.toString(16),
                "0x" + <string>this.Q.y.n.toString(16),
            ],
            v: this.v.toString(),
        };
    }

    /*
     * hexify() but everything is kept in base10
     */
    base10(): { P: string[]; Q: string[]; v: string } {
        return {
            P: [
                "0x" + <string>this.P.x.n.toString(10),
                "0x" + <string>this.P.y.n.toString(10),
            ],
            Q: [
                "0x" + <string>this.Q.x.n.toString(10),
                "0x" + <string>this.Q.y.n.toString(10),
            ],
            v: this.v.toString(),
        };
    }

    /*
     * Computes poseidon hash for leaf.
     */
    poseidonHash(poseidon: any): BigInt {
        const hexified = this.hexify();
        return BigInt(
            poseidon.F.toString(
                poseidon([...hexified.P, ...hexified.Q, hexified.v]),
                10
            )
        );
    }

    /*
     * Wrapper around hexify() to actually return a string.
     */
    toString(): string {
        return JSON.stringify(this.hexify());
    }

    /*
     * Exports leaf information in the format expected by deposit() in the
     * contract
     */
    exportCallData(): [SolPointStr, SolPointStr] {
        return [
            {
                x: Utils.bigNumToBytes32(this.P.x.n).toString(),
                y: Utils.bigNumToBytes32(this.P.y.n).toString(),
            },
            {
                x: Utils.bigNumToBytes32(this.Q.x.n).toString(),
                y: Utils.bigNumToBytes32(this.Q.y.n).toString(),
            },
        ];
    }
}
