const ethers = require("ethers");
const dotenv = require("dotenv");

const CONTRACT_ADDR: string = "0x0ABda61CaF0aC805c40746Fd47e9Bf384517144d";
const CONTRACT_ABI =
    require("../contracts/out/PrivateTreasury.sol/PrivateTreasury.json").abi;

const privateTreasury = new ethers.Contract(
    CONTRACT_ADDR,
    CONTRACT_ABI,
    process.env.RPC_URL
);
