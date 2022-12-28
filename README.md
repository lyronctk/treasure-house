# Private Treasury
A platform for DAOs with private treasuries. Based on [work done by Griffin Dunaif & Dan Boneh](https://hackmd.io/nCASdhqVQNWwMhpTmKpnKQ).

## Overview
![Overview Graphic](diagrams/overview.png)

Front-running is a consistent issue that many DAOs built on non-privacy enabled chains encounter in their day-to-day operations. One class of DAOs that are particularly impacted are collector DAOs that participate in sealed-bid auctions. Public verifiability of their treasuries puts them at a significant disadvantage, with the most prominent example being [ConstitutionDAO's loss in late 2021](https://decrypt.co/86491/constitutiondao-lost-auction-anti-bitcoin-citadel-ceo-ken-griffin). 

Balance hiding is a promising solution. The treasury implementation provided in this repository satisfies this property using a simple scheme based on [elliptic curve diffie-hellman key exchange](https://cryptobook.nakov.com/asymmetric-key-ciphers/ecdh-key-exchange). The core components of the scheme are as follows. 

One contract instance for this treasury is designed to support multiple DAOs to form an anonymity set. Rather than sending ETH to different contracts per treasury, contributors are meant to send ETH to this main contract, along with a cryptographic puzzle that only the DAO manager(s) know the solution to. The puzzle is a diffie-hellman shared key that's derived from the DAO manager's public key (not the same as their ethereum pubkey) and a nonce sampled by the contributor. Two important properties of this shared key are
1. Safety is protected by the hardness of discrete-log. Adversaries can't withdraw funds that don't belong to them.
1. Anonymity follows from the decisional diffie-hellman assumption. The shared key doesn't reveal anything about the target DAO public key. 
Thus, outside observers only know the total balance of all DAOs on the platform, but not how much each DAO is entitled to. 

Treasury managers check each deposit as it comes in to see whether their secret key can solve the attached puzzle. They can then redeem leaves posting a zkSNARK proof that verifies 1) knowledge of the secret and 2) inclusion of these leaves in the on-chain merkle tree. 

## Lifecycle of a Deposit
![ECDH](diagrams/ecdh.png)
The above figure further specifies the puzzle attached to each leaf. 

## Goerli Deployments
1. Main contract: `0x5dAb294C7698B8Bd1a3d90557223349Fe5B35BbD`
1. Groth16 verifier: `0xac71523A21Dd82C7645Edec341e90022aDF51F98`

## Getting Started

## Future Roadmap
1. Switch to C++ witness generation for SNARK. 
1. Implement CLI functions as MetaMask Snaps.
1. Store frontier nodes for Merkle tree off-chain to make gas consumption for 
   deposits reasonable. 
1. Fork JuiceBox / Aragon & add private treasuries feature. 
1. [optional] Write a ledger VM to support proof generation. 
