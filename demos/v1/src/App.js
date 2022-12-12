import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";

function App() {
    const [account1Balance, setAccount1Balance] = useState(0);
    const [account2Balance, setAccount2Balance] = useState(0);

    const provider = new ethers.providers.JsonRpcProvider(
        RPC_URL
    );

    function formatBalance(b) {
        return Math.round(ethers.utils.formatEther(b));
    }

    useEffect(() => {
        setInterval(() => {
            async function updateBalance() {
                setAccount1Balance(
                    formatBalance(await provider.getSigner(1).getBalance())
                );
                setAccount2Balance(
                    formatBalance(await provider.getSigner(2).getBalance())
                );
            }
            updateBalance();
        }, 500);
    });

    return (
        <div className="row">
            <div className="column">
                <h1>Create</h1>
            </div>
            <div className="column">
                <h1>Deposit</h1>
            </div>
            <div className="column">
                <h1>Withdraw</h1>
                <h3>Account Balance</h3>
                <ul>
                    <li>Account #1: {account1Balance} ETH</li>
                    <li>Account #2: {account2Balance} ETH</li>
                </ul>
            </div>
        </div>
    );
}

export default App;
