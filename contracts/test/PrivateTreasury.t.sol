// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PrivateTreasury.sol";

contract PrivateTreasuryTest is Test {
    PrivateTreasury public privTreasury;

    function setUp() public {
        privTreasury = new PrivateTreasury();
    }

    function testCreate() public {
        PrivateTreasury.Point memory pk = PrivateTreasury.Point(
            bytes32("123"),
            bytes32("456")
        );
        privTreasury.create(pk, "t1");
        assertEq(privTreasury.getDirectoryLength(), 1);
    }

    function testDeposit() public {
        PrivateTreasury.Point memory P = PrivateTreasury.Point(
            bytes32("111"),
            bytes32("222")
        );
        PrivateTreasury.Point memory Q = PrivateTreasury.Point(
            bytes32("333"),
            bytes32("444")
        );
        privTreasury.deposit{value: 555}(P, Q);
        assertEq(privTreasury.getNumDeposits(), 1);
    }
}
