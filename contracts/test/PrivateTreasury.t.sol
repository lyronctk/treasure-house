// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PrivateTreasury.sol";

/// @dev  Inherits from PrivateTreasury to expose private / internal functions
///       for testing
contract PrivateTreasuryPublic is PrivateTreasury {
    function hashLeftRight(uint256 l, uint256 r) public view returns (uint256) {
        return _hashLeftRight(l, r);
    }

    // function hashLeaf(Leaf calldata lf) public view returns (bytes32) {
    //     return _hashLeaf(lf);
    // }
}

contract PrivateTreasuryTest is Test {
    PrivateTreasuryPublic public privTreasury;
    address manager = address(0x123);
    address contributor = address(0x456);

    function setUp() public {
        privTreasury = new PrivateTreasuryPublic();
        vm.deal(contributor, 10 ether);
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
        PrivateTreasury.Point memory Pt = PrivateTreasury.Point(
            bytes32("111"),
            bytes32("222")
        );
        PrivateTreasury.Point memory Qt = PrivateTreasury.Point(
            bytes32("333"),
            bytes32("444")
        );
        privTreasury.deposit{value: 555}(Pt, Qt);
        assertEq(privTreasury.getNumDeposits(), 1);
    }

    /* [TODO] Figure out why proof doesn't verify in unit test
    ///@dev Only passes when verifierContract.verifyProof() is commented out in
    ///     withdraw. Not sure why, but proof verification works correctly
    ///     when it is sent through ethers.
    function testWithdraw() public {
        PrivateTreasury.Point P = PrivateTreasury.Point(
            bytes32(
                hex"0beb072cad1738dae866e6efe0080d086481900dea98d73cc80abdf5ea0d061f"
            ),
            bytes32(
                hex"07c856388448bd7b93c909b4eeb8f6268e6cadac5b3011450593da038dae7945"
            )
        );
        PrivateTreasury.Point Q = PrivateTreasury.Point(
            bytes32(
                hex"07d391b607f465e1e8d6bd3e4ff87a24f3a86a5f70a2d825c3a60500e89cf83d"
            ),
            bytes32(
                hex"1fc64b3d1eed248c634469d98ac1b5774711bb2c370cf7775074da5a9c11b591"
            )
        );

        uint256[2] a = [
            0x1494871a35a3a00b313302be5bdf6e8b3e37977254c42dfca3b17c1709807b08,
            0x2f64010109c1e9f4f88ef254a3e419c8afb0ee40bfd3fb2d765b93e22539851b
        ];
        uint256[2][2] b = [
            [
                0x16b8386b74a031e9ea462d31c5f3345f2b798bfea4adffba35fb9a6ab97f4e68,
                0x18e9745d078f999093db2266cdb147a956e6c44880e88884119e07fcdc9789f3
            ],
            [
                0xea2db8f65c49e9c5f2c8b1ea04c682d0b837974724213f20f9206e0e58cf21f,
                0x82e1ac74769e80726385a39ac598913af3e2446cbc580c6cf21b903fedcb72d
            ]
        ];
        uint256[2] c = [
            0x2d790d2703b967efb5b5a5083ba4e4ba53b56f0a6b23d2936fbafa1b6e20708b,
            0x1fa91eb8ca52b9df25f71fa7535506ef413580e48198cf54011347f50161b147
        ];
        uint256[4] publicSignals = [
            0x0beb072cad1738dae866e6efe0080d086481900dea98d73cc80abdf5ea0d061f,
            0x07c856388448bd7b93c909b4eeb8f6268e6cadac5b3011450593da038dae7945,
            0x07d391b607f465e1e8d6bd3e4ff87a24f3a86a5f70a2d825c3a60500e89cf83d,
            0x1fc64b3d1eed248c634469d98ac1b5774711bb2c370cf7775074da5a9c11b591
        ];

        vm.prank(contributor);
        privTreasury.deposit{value: 0.5 ether}(P, Q);

        // Deposit at index 5 doesn't exist
        vm.expectRevert();
        privTreasury.withdraw(5, a, b, c, publicSignals);

        // P & Q must match deposit that is targeted for withdrawal
        publicSignals[0] = 0x0;
        vm.expectRevert();
        privTreasury.withdraw(0, a, b, c, publicSignals);
        publicSignals[
            0
        ] = 0x0beb072cad1738dae866e6efe0080d086481900dea98d73cc80abdf5ea0d061f;

        // Valid withdrawal by manager
        vm.prank(manager);
        privTreasury.withdraw(0, a, b, c, publicSignals);
        assertEq(manager.balance, 0.5 ether);

        // Can't withdraw the same deposit twice
        vm.expectRevert();
        privTreasury.withdraw(0, a, b, c, publicSignals);
    }
    */

    function testHashLeftRight() public {
        privTreasury.hashLeftRight(
            9948391018672119960781640937151244503567224804480552920821941951362687606764,
            19163032811178603957473047321212298289404548879370344163622112305342257799377
        );

        // assertEq(
        //     privTreasury.hashLeftRight(
        //         hex"15fe96fb8f1c04eb64daebcd62c9e00b7e2ed32a00c03ed558a709fd1b649fec",
        //         hex"2a5de467b0c3a78f277dee002f7d1e5800ac8ac49127455e74fb9e6bfc7fa0d1"
        //     ),
        //     bytes32(
        //         3899482643554963682545393252061672305510324849433545848585514855908638026608
        //     )
        // );
    }

    // function testHashLeaf() public {
    //     PrivateTreasury.Leaf memory lf = PrivateTreasury.Leaf(
    //         PrivateTreasury.Point(
    //             bytes32(
    //                 hex"03d41989eb0e6073809ce4f0f3c080a5959dd6cec8d83cf51007b5612c005842"
    //             ),
    //             bytes32(
    //                 hex"088bdbd3cff5e1c9ec34d10eaba9a5a07fd0ad5721a6b97d1ff01e9a831aa688"
    //             )
    //         ),
    //         PrivateTreasury.Point(
    //             bytes32(
    //                 hex"1b5946a587518647031c3ef456f576bc8eb52ca4e5f7eaca61bfb9a950a56bc1"
    //             ),
    //             bytes32(
    //                 hex"053fa127f43ad708408035fee59dd3a3f9bac5f38ac8eb3b0f95350c5e460409"
    //             )
    //         ),
    //         123000000000000000,
    //         false
    //     );

    //     assertEq(
    //         privTreasury.hashLeaf(lf),
    //         bytes32(
    //             hex"15fe96fb8f1c04eb64daebcd62c9e00b7e2ed32a00c03ed558a709fd1b649fec"
    //         )
    //     );
    // }
}
