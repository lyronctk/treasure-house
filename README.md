# Private Treasury

## Overview
Platform for DAOs with private treasuries. Based on [work done by Griffin Dunaif & Dan Boneh](https://hackmd.io/nCASdhqVQNWwMhpTmKpnKQ).

## Rest of Roadmap
0. Switch to C++ witness generation for SNARK. Much faster. 
1. Deposit merkle tree. Managers create inclusion proofs by querying indexers 
   for emitted deposit events. Maintain list of hashes of spent leaves. 
2. Batch withdrawals. SNARK now covers batch merkle proofs and batch jubjub
   proofs. 
3. Spec out using MetaMask Snaps for jubjub keygen, private key storage, and 
   proof generation. 
4. Barebones UI. 
5. Integrate Snaps. 
6. Fork JuiceBox & add private treasuries feature. 
7. [optional] Store spent leaves in a Merkle tree. Managers need to submit 
              Merkle exclusion proofs. 
8. [optional] Write a ledger VM to support proof generation. 
