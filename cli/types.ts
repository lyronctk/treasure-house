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
