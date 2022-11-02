import { ethers } from "ethers";
import { Bytes32 } from "soltypes";

const { Point } = require("./node_modules/babyjubjub/lib/Point.js");

export type Deposit = {
    // ρ * G
    P: InstanceType<typeof Point>;

    // ρ * treasuryPk
    Q: InstanceType<typeof Point>;

    // amount of ETH, denoted in wei
    v: ethers.BigNumber;
};

export type SolPoint = {
    x: Bytes32;
    y: Bytes32;
};
