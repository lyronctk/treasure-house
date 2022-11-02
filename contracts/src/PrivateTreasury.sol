// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title Private treasuries
/// @notice Platform for managing treasuries with balance & withdrawal privacy
/// @dev A POC, not audited
contract PrivateTreasury {
    struct Point {
        bytes32 x;
        bytes32 y;
    }

    struct Treasury {
        Point pk;
        string label;
    }

    struct Deposit {
        Point P;
        Point Q;
        uint256 v;
    }

    /// @dev Directory of treasuries can be stored off-chain
    Treasury[] public directory;

    /// @dev Should be stored in a Merkle Tree instead of an array
    Deposit[] public deposits;

    /// @notice Treasury creation
    /// @param pk Public key generated from Babyjubjub
    /// @param label Name given to treasury, use only as descriptor, not lookup
    function create(Point calldata pk, string calldata label) external {
        directory.push(Treasury(pk, label));
    }

    function deposit(Point calldata P, Point calldata Q) external payable {
        require(msg.value > 0, "Deposited ether value must be > 0.");
        deposits.push(Deposit(P, Q, msg.value));
    }

    function getNumDeposits() external view returns (uint256) {
        return deposits.length;
    }

    /// @notice Access length of directory
    function getDirectoryLength() external view returns (uint256) {
        return directory.length;
    }
}
