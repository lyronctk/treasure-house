require("hardhat-circom");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.6.11",
            },
            {
                version: "0.8.9",
            },
        ],
    },
    circom: {
        inputBasePath: "./circuits",
        ptau: "https://hermezptau.blob.core.windows.net/ptau/powersOfTau28_hez_final_15.ptau",
        circuits: [
            {
                name: "verif-manager",
                protocol: "groth16",
            },
        ],
    },
};
