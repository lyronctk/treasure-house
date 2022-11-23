import { ethers } from "ethers";

const { Point } = require("./node_modules/babyjubjub/lib/Point.js");
const { PublicKey, PrivateKey } = require("babyjubjub");

import { SolPointStr } from "./types";
import Utils from "./utils";

export default class Leaf {
    P: InstanceType<typeof Point>;
    Q: InstanceType<typeof Point>;
    v: ethers.BigNumber;

    /*
     * Instantiates a leaf (P, Q, v), where P is the contributor's public 
     * key, Q is a "shared secret" that can only be derived by the manager's 
     * public key with P, and v is the amount of Ether to contribute (specified 
     * in wei).
     */
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
        if (!solLeaf) throw new Error("Tried to cast a null Solidity leaf.")
        return new Leaf(
            Utils.hexStringPairToPoint(Utils.parseGetterPoint(solLeaf.P)),
            Utils.hexStringPairToPoint(Utils.parseGetterPoint(solLeaf.Q)),
            solLeaf["v"],
        );
    }

    /*
     * A sanity check to ensure that the manager, who holds the treasury's private
     * key (α), is able to redeem the leaf by satisfying the constraint
     * P * α = G.
     */
    verifyQDerivation(treasuryPriv: InstanceType<typeof PrivateKey>) {
        console.log("== Sanity check");
        const derivedQ: InstanceType<typeof Point> = this.P.mult(
            treasuryPriv.s
        );
        console.log("Derived Q via treasury private key:", [
            derivedQ.x.n.toString(10),
            derivedQ.y.n.toString(10),
        ]);
        console.log("Equal to leaf's Q?", derivedQ.isEqualTo(this.Q));
        console.log("==");
    }

    /*
     * Stringify.
     */
    toString(): string {
        return {
            P: [this.P.x.n.toString(16), this.P.y.n.toString(16)],
            Q: [this.Q.x.n.toString(16), this.Q.y.n.toString(16)],
            v: this.v.toString(),
        }.toString();
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
            }
        ];
    }
}
