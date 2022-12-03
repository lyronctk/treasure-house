// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IncrementalMerkleTree} from "./IncrementalMerkleTree.sol";

/// @title Interface for the solidity verifier produced by verif-manager.circom
interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) external view returns (bool);
}

/// @title Interface for poseidon hasher where t = 3
interface IHasherT3 {
    function poseidon(uint256[2] memory input) external pure returns (uint256);
}

/// @title Interface for poseidon hasher where t = 6
interface IHasherT6 {
    function poseidon(uint256[5] calldata input)
        external
        pure
        returns (uint256);
}

/// @title Private treasuries
/// @notice Platform for managing treasuries with balance & withdrawal privacy
/// @dev Do not use in prod. This is a POC that has not undergone any audits.
contract PrivateTreasury is IncrementalMerkleTree {
    address public constant VERIFIER_ADDR =
        0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0;
    address public constant POSEIDON_T3_ADDR =
        0x8464135c8F25Da09e49BC8782676a84730C318bC;
    address public constant POSEIDON_T6_ADDR =
        0x71C95911E9a5D330f4D621842EC243EE1343292e;

    uint8 internal constant TREE_DEPTH = 32;
    // Keccak256 hash of 'Maci'
    uint256 internal constant NOTHING_UP_MY_SLEEVE =
        8370432830353022751713833565135785980866757267633941821328460903436894336785;

    IVerifier verifierContract = IVerifier(VERIFIER_ADDR);
    IHasherT3 hasherT3 = IHasherT3(POSEIDON_T3_ADDR);
    IHasherT6 hasherT6 = IHasherT6(POSEIDON_T6_ADDR);

    struct Point {
        bytes32 x;
        bytes32 y;
    }

    struct Treasury {
        Point pk;
        string label;
    }

    struct Leaf {
        Point P;
        Point Q;
        uint256 v;
    }

    /// @notice Emitted whenever a new leaf is added to the tree
    event NewLeaf(Leaf lf);

    /// @dev Directory of treasuries can be stored off-chain
    Treasury[] public directory;

    /// @notice Inherits from Maci's Incremental Merkle Tree
    constructor() IncrementalMerkleTree(TREE_DEPTH, NOTHING_UP_MY_SLEEVE) {}

    /// @notice Keep track of leaves that have been spent
    mapping(uint256 => bool) spentLeaves;

    /// @notice Treasury creation
    /// @param pk Public key generated from Babyjubjub
    /// @param label Name given to treasury, use only as descriptor, not lookup
    function create(Point calldata pk, string calldata label) external {
        directory.push(Treasury(pk, label));
    }

    /// @notice Contribute to a treasury on the platform
    /// @param P Pubkey of contributor (ρ * G, where ρ is contributor's privKey)
    /// @param Q ρ * treasuryPubKey, a val that can only be derived using
    ///          α * P (where α is the treasury's private key)
    function deposit(Point calldata P, Point calldata Q) external payable {
        require(msg.value > 0, "Deposited ether value must be > 0.");
        Leaf memory lf = Leaf(P, Q, msg.value);
        emit NewLeaf(lf);
        insertLeaf(_hashLeaf(lf));
    }

    /// @notice Number of filled leaves in Merkle tree
    function getNumDeposits() public view returns (uint256) {
        return nextLeafIndex;
    }

    /// @notice Access length of directory
    function getDirectoryLength() external view returns (uint256) {
        return directory.length;
    }

    /// @notice For managers to withdraw deposits belonging to their treasury
    /// @param a pi_a in proof
    /// @param b pi_b in proof
    /// @param c pi_c in proof
    /// @param publicSignals Public signals associated with the proof
    function withdraw(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory publicSignals
    ) external payable {
        require(
            verifierContract.verifyProof(a, b, c, publicSignals),
            "Invalid withdrawal proof"
        );
        uint256 _v = publicSignals[0];
        uint256 _root = publicSignals[1];
        uint256 _leafIdx = publicSignals[2];

        require(
            _root == root,
            "Merkle root associated w/ proof doesn't match on-chain root."
        );

        require(_leafIdx < getNumDeposits(), "Invalid requested deposit index");
        require(!spentLeaves[_leafIdx], "Deposit already spent");
        spentLeaves[_leafIdx] = true;

        payable(msg.sender).transfer(_v);
    }

    /// @notice Produces poseidon hash of two children hashes
    /// @dev Should be internal, but set to public so tests can run from
    ///      ethers. Not ideal, but foundry tests are being wonky.
    function _hashLeftRight(uint256 l, uint256 r)
        public
        view
        override
        returns (uint256)
    {
        return hasherT3.poseidon([l, r]);
    }

    /// @notice Produces poseidon hash of a leaf ()
    /// @dev Should be internal, but set to public so tests can run from
    ///      ethers. Not ideal, but foundry tests are being wonky.
    function _hashLeaf(Leaf memory lf) public view returns (uint256) {
        return
            hasherT6.poseidon(
                [
                    uint256(lf.P.x),
                    uint256(lf.P.y),
                    uint256(lf.Q.x),
                    uint256(lf.Q.y),
                    lf.v
                ]
            );
    }
}
