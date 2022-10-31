import { errorMonitor } from "stream";

const BN = require("bn.js");
const ethers = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const { PublicKey, PrivateKey, Point } = require("babyjubjub");

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
    process.env.MANAGER_ETH_PRIVKEY,
    new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
const privateTreasury = new ethers.Contract(
    CONTRACT_ADDR,
    CONTRACT_ABI,
    signer
);

function bigNumToBytes32(n: InstanceType<typeof BN>): string {
    return ethers.utils.hexZeroPad(
        ethers.BigNumber.from(n.toString(10)).toHexString(),
        32
    );
}

async function createTreasury(): Promise<any> {
    const managerPriv = new PrivateKey(PrivateKey.getRandObj().field);
    const managerPub = PublicKey.fromPrivate(managerPriv);

    console.log("Sending tx to create treasury with manager's pub: ", [
        managerPub.p.x.n.toString(16),
        managerPub.p.y.n.toString(16),
    ]);

    return privateTreasury.create(
        bigNumToBytes32(managerPub.p.x.n),
        bigNumToBytes32(managerPub.p.y.n),
        TREASURY_LABEL
    );
}

createTreasury()
    .then((res) => {
        console.log("Operation SUCCESS:", res);
    })
    .catch((err) => {
        console.log("Operation FAILED:", err.message);
    });
