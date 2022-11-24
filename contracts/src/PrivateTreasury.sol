// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title Interface for the solidity verifier produced by verif-manager.circom
interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input
    ) external view returns (bool);
}

/// @title Interface for poseidon hasher where t = 3
interface IHasherT3 {
    function poseidon(bytes32[2] calldata leftRight)
        external
        pure
        returns (bytes32);
}

/// @title Interface for poseidon hasher where t = 6
interface IHasherT6 {
    function poseidon(bytes32[5] calldata leftRight)
        external
        pure
        returns (bytes32);
}

/// @title Private treasuries
/// @notice Platform for managing treasuries with balance & withdrawal privacy
/// @dev This is a POC that has not undergone any audits.
contract PrivateTreasury {
    address public constant VERIFIER_ADDR =
        0x5FbDB2315678afecb367f032d93F642f64180aa3;
    address public constant POSEIDON_T3_ADDR =
        0x677df0cb865368207999F2862Ece576dC56D8dF6;
    address public constant POSEIDON_T6_ADDR =
        0x0Cf17D5DcDA9cF25889cEc9ae5610B0FB9725F65;

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
        bool spent;
    }

    event NewLeaf(Leaf lf);

    /// @dev Directory of treasuries can be stored off-chain
    Treasury[] public directory;

    /// @dev Should be stored in a Merkle Tree instead of an array
    Leaf[] public deposits;

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
        Leaf memory lf = Leaf(P, Q, msg.value, false);
        deposits.push(lf);
        emit NewLeaf(lf);
    }

    /// @notice Enable managers to withdraw deposits belonging to their treasury
    /// @param leafIdx Index of target leaf to withdraw in deposits[]
    /// @param a pi_a in proof
    /// @param b pi_b in proof
    /// @param c pi_c in proof
    /// @param publicSignals Public signals associated with the proof
    function withdraw(
        uint256 leafIdx,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory publicSignals
    ) external payable {
        require(
            verifierContract.verifyProof(a, b, c, publicSignals),
            "Invalid withdrawal proof"
        );
        require(leafIdx < deposits.length, "Invalid requested deposit index");

        Leaf storage tgtDep = deposits[leafIdx];
        require(!tgtDep.spent, "Deposit already spent");

        require(
            bytes32(publicSignals[0]) == tgtDep.P.x,
            "Public signals for proof don't match P for the target deposit"
        );
        require(
            bytes32(publicSignals[1]) == tgtDep.P.y,
            "Public signals for proof don't match P for the target deposit"
        );
        require(
            bytes32(publicSignals[2]) == tgtDep.Q.x,
            "Public signals for proof don't match Q for the target deposit"
        );
        require(
            bytes32(publicSignals[3]) == tgtDep.Q.y,
            "Public signals for proof don't match Q for the target deposit"
        );

        payable(msg.sender).transfer(tgtDep.v);
        tgtDep.spent = true;
    }

    /// @notice Access length of deposits
    function getNumDeposits() external view returns (uint256) {
        return deposits.length;
    }

    /// @notice Access length of directory
    function getDirectoryLength() external view returns (uint256) {
        return directory.length;
    }
}
