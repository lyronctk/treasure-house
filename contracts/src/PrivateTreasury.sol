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

    /// @dev Directory of treasuries can be stored off-chain
    Treasury[] public directory;

    /// @notice Treasury creation
    /// @param pkX X value for public key generated from Babyjubjub
    /// @param pkY Y value for public key generated from Babyjubjub
    /// @param label Name given to treasury, use only as descriptor, not lookup
    function create(bytes32 pkX, bytes32 pkY, string calldata label) external {
        directory.push(Treasury(Point(pkX, pkY), label));
    }

    /// @notice Access length of directory 
    function getDirectoryLength() external view returns(uint dirLength) {
        return directory.length;
    }
}
