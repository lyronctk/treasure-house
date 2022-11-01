import dotenv from "dotenv";

import { BN } from "bn.js";
import { Bytes32 } from "soltypes";
import { ethers } from "ethers";
const { PublicKey, PrivateKey, Point } = require("babyjubjub");

dotenv.config();

const CONTRACT_ADDR: string = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const CONTRACT_ABI =
    require("../contracts/out/PrivateTreasury.sol/PrivateTreasury.json").abi;

const TREASURY_LABEL: string = "test";

interface Deposit {
    // ρ * G
    P: InstanceType<typeof Point>;

    // ρ * managerPk
    Q: InstanceType<typeof Point>;

    // amount of ETH
    v: InstanceType<typeof BN>;
}

const signer = new ethers.Wallet(
    <string>process.env.MANAGER_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
const privateTreasury = new ethers.Contract(
    CONTRACT_ADDR,
    CONTRACT_ABI,
    signer
);

function bigNumToBytes32(n: InstanceType<typeof BN>): Bytes32 {
    return new Bytes32(
        ethers.utils.hexZeroPad(
            ethers.BigNumber.from(n.toString(10)).toHexString(),
            32
        )
    );
}

async function createTreasury() {
    const managerPriv = new PrivateKey(PrivateKey.getRandObj().field);
    const managerPub = PublicKey.fromPrivate(managerPriv);

    console.log("== Sending tx to create treasury")
    console.log("Manager's pub:", [
        managerPub.p.x.n.toString(16),
        managerPub.p.y.n.toString(16),
    ]);
    const res = await privateTreasury.create(
        bigNumToBytes32(managerPub.p.x.n).toString(),
        bigNumToBytes32(managerPub.p.y.n).toString(),
        TREASURY_LABEL
    );
    console.log("Response:", res);
    console.log("==");
}

async function getDirectory() {
    const dirLen = await privateTreasury.getDirectoryLength();
    console.log(
        `== Current directory before adding new treasury (len = ${dirLen})`
    );
    for (var i = 0; i < dirLen.toNumber(); i++) {
        const entry = await privateTreasury.directory(i);
        console.log(entry["label"], ':', [entry["pk"]["x"], entry["pk"]["y"]]);
    }
    console.log("==");
}

(async () => {
    await getDirectory();
    await createTreasury();
})();
