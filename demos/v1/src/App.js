import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "@ethersproject/shims";

const { Point } = require("./Point.js");
const { FQ } = require("./Field");

const RPC_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDR = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const CONTRACT_ABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "bytes32",
                                name: "x",
                                type: "bytes32",
                            },
                            {
                                internalType: "bytes32",
                                name: "y",
                                type: "bytes32",
                            },
                        ],
                        internalType: "struct PrivateTreasury.Point",
                        name: "P",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "bytes32",
                                name: "x",
                                type: "bytes32",
                            },
                            {
                                internalType: "bytes32",
                                name: "y",
                                type: "bytes32",
                            },
                        ],
                        internalType: "struct PrivateTreasury.Point",
                        name: "Q",
                        type: "tuple",
                    },
                    {
                        internalType: "uint256",
                        name: "v",
                        type: "uint256",
                    },
                ],
                indexed: false,
                internalType: "struct PrivateTreasury.Leaf",
                name: "lf",
                type: "tuple",
            },
        ],
        name: "NewLeaf",
        type: "event",
    },
    {
        inputs: [],
        name: "POSEIDON_T3_ADDR",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "POSEIDON_T6_ADDR",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "VERIFIER_ADDR",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "bytes32",
                                name: "x",
                                type: "bytes32",
                            },
                            {
                                internalType: "bytes32",
                                name: "y",
                                type: "bytes32",
                            },
                        ],
                        internalType: "struct PrivateTreasury.Point",
                        name: "P",
                        type: "tuple",
                    },
                    {
                        components: [
                            {
                                internalType: "bytes32",
                                name: "x",
                                type: "bytes32",
                            },
                            {
                                internalType: "bytes32",
                                name: "y",
                                type: "bytes32",
                            },
                        ],
                        internalType: "struct PrivateTreasury.Point",
                        name: "Q",
                        type: "tuple",
                    },
                    {
                        internalType: "uint256",
                        name: "v",
                        type: "uint256",
                    },
                ],
                internalType: "struct PrivateTreasury.Leaf",
                name: "lf",
                type: "tuple",
            },
        ],
        name: "_hashLeaf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "l",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "r",
                type: "uint256",
            },
        ],
        name: "_hashLeftRight",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "x",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "y",
                        type: "bytes32",
                    },
                ],
                internalType: "struct PrivateTreasury.Point",
                name: "pk",
                type: "tuple",
            },
            {
                internalType: "string",
                name: "label",
                type: "string",
            },
        ],
        name: "create",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "x",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "y",
                        type: "bytes32",
                    },
                ],
                internalType: "struct PrivateTreasury.Point",
                name: "P",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "x",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "y",
                        type: "bytes32",
                    },
                ],
                internalType: "struct PrivateTreasury.Point",
                name: "Q",
                type: "tuple",
            },
        ],
        name: "deposit",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "directory",
        outputs: [
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "x",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "y",
                        type: "bytes32",
                    },
                ],
                internalType: "struct PrivateTreasury.Point",
                name: "pk",
                type: "tuple",
            },
            {
                internalType: "string",
                name: "label",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getDirectoryLength",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getNumDeposits",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "root",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "spentLeaves",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "x",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "y",
                        type: "bytes32",
                    },
                ],
                internalType: "struct PrivateTreasury.Point",
                name: "changeP",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "x",
                        type: "bytes32",
                    },
                    {
                        internalType: "bytes32",
                        name: "y",
                        type: "bytes32",
                    },
                ],
                internalType: "struct PrivateTreasury.Point",
                name: "changeQ",
                type: "tuple",
            },
            {
                internalType: "uint256[2]",
                name: "a",
                type: "uint256[2]",
            },
            {
                internalType: "uint256[2][2]",
                name: "b",
                type: "uint256[2][2]",
            },
            {
                internalType: "uint256[2]",
                name: "c",
                type: "uint256[2]",
            },
            {
                internalType: "uint256[11]",
                name: "publicSignals",
                type: "uint256[11]",
            },
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];

function App() {
    const [managerBalance, setManagerBalance] = useState(0);
    const [contributorBalance, setContributorBalance] = useState(0);
    const [leaves, setLeaves] = useState([]);
    const [treasuryPriv, setTreasuryPriv] = useState("");
    const [platformBalance, setPlatformBalance] = useState(0);
    const [availWithdraw, setAvailWithdraw] = useState(0);
    const [merkleRoot, setMerkleRoot] = useState("");

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const privateTreasury = new ethers.Contract(
        CONTRACT_ADDR,
        CONTRACT_ABI,
        provider.getSigner(1)
    );

    function formatBalance(b) {
        return Math.round(ethers.utils.formatEther(b));
    }

    async function updateBalance() {
        setPlatformBalance(
            formatBalance(await provider.getBalance(CONTRACT_ADDR))
        );
        setManagerBalance(
            formatBalance(await provider.getSigner(1).getBalance())
        );
        setContributorBalance(
            formatBalance(await provider.getSigner(2).getBalance())
        );
    }

    function checkOwnership(P, Q, privKey) {
        if (privKey == "") return -1;
        const derivedQ = new Point(P.x, P.y).mult(new FQ(privKey));
        return derivedQ.isEqualTo(new Point(Q.x, Q.y)) ? 1 : 0;
    }

    async function updateLeaves() {
        const newLeafEvents = await privateTreasury.queryFilter(
            privateTreasury.filters.NewLeaf()
        );
        const leafHistory = await Promise.all(
            newLeafEvents.map(async (e, idx) => {
                const solLf = e.args?.lf;
                return {
                    P: `${solLf.P.x.toString(16).substring(0, 24)}...`,
                    Q: `${solLf.Q.x.toString(16).substring(0, 24)}...`,
                    v: Number(ethers.utils.formatEther(solLf["v"])),
                    isUnspent: !(await privateTreasury.spentLeaves(idx)),
                    isOwned: checkOwnership(solLf.P, solLf.Q, treasuryPriv),
                };
            })
        );
        setMerkleRoot(
            (await privateTreasury.root()).toHexString().substring(0, 24)
        );
        setAvailWithdraw(
            leafHistory.reduce((partialSum, lf) => {
                if (lf.isOwned === 1 && lf.isUnspent) return partialSum + lf.v;
                return partialSum;
            }, 0)
        );
        setLeaves(leafHistory);
    }

    useEffect(() => {
        updateBalance();
        updateLeaves();
        const interval = setInterval(() => {
            updateBalance();
            updateLeaves();
        }, 2000);
        return () => clearInterval(interval);
    }, [treasuryPriv]);

    function renderUnspentDisplay(isUnspent) {
        if (isUnspent) return <p>&#x2705;</p>;
        return <p>&#10060;</p>;
    }

    function renderOwnedDisplay(isOwned) {
        switch (isOwned) {
            case 0:
                return <p>&#10060;</p>;
            case 1:
                return <p>&#x2705;</p>;
            default:
                return <p>&#10067;</p>;
        }
    }

    return (
        <section className="ftco-section">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center mb-5">
                        <p>
                            Merkle root: <b>{merkleRoot}...</b>
                        </p>
                        <p></p>
                        <p>
                            Manager balance: <b>{managerBalance} ETH</b>
                        </p>
                        <p>
                            Contributor balance: <b>{contributorBalance} ETH</b>
                        </p>
                        <p></p>
                        <p>
                            Total balance of platform:{" "}
                            <b>{platformBalance} ETH</b>
                        </p>
                        <p>
                            Amount available to withdraw:{" "}
                            <b>{availWithdraw} ETH</b>
                        </p>
                    </div>
                </div>
                <input
                    className="texrbox-10"
                    type="text"
                    onChange={(e) => setTreasuryPriv(e.target.value)}
                    value={treasuryPriv}
                    placeholder="Enter treasury private key here"
                />
                <div className="row">
                    <div className="col-md-12">
                        <div className="table-wrap">
                            <table className="table table-bordered table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>P</th>
                                        <th>Q</th>
                                        <th>v</th>
                                        <th>available</th>
                                        <th>owned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((lf) => (
                                        <tr key={lf.P + lf.v}>
                                            <td>{lf.P}</td>
                                            <td>{lf.Q}</td>
                                            <td>{lf.v} ETH</td>
                                            <td>
                                                <p>
                                                    {renderUnspentDisplay(
                                                        lf.isUnspent
                                                    )}
                                                </p>
                                            </td>
                                            <td>
                                                {renderOwnedDisplay(lf.isOwned)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default App;
