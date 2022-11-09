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

    function testWithdraw() public {
        PrivateTreasury.Point memory P = PrivateTreasury.Point(
            bytes32(
                hex"2d46911986df834beb1d615b8c2c9794fb4762e3ec0db0e91c588310c2d8a79d"
            ),
            bytes32(
                hex"156197d384811e1b0c71c6ed50b9d1deec2b3059d53b8da5c6ddb6f96e93a979"
            )
        );
        PrivateTreasury.Point memory Q = PrivateTreasury.Point(
            bytes32(
                hex"1b7f89ff0adad7bad0e9b31d2e523c6dd3d03deca424544bb4e5e7a5209cc09f"
            ),
            bytes32(
                hex"2440cad5a2fb2f3fc9c7ab335a7d478287176d7ee4d1f2f50ca628ead4351b2a"
            )
        );
        privTreasury.deposit{value: 100000000000000000}(P, Q);

        uint256[2] memory a = [
            4012197819164519766886783281619348710294318060955348492120027683325758347805,
            13161382740526940745376601417635425615612508229743615715282349795543635843704
        ];
        uint256[2][2] memory b = [
            [
                6216026889400242943957795714267887595120036660381425285003863510738630629545,
                7744916491123675778255681982469705953723438089851295790346771739504946714576
            ],
            [
                7288446359811989128957304196239144920763373798433920936278927055815650505961,
                7573991287059282727378066107778508053577352671172443257823457344599760655701
            ]
        ];
        uint256[2] memory c = [
            5723715085062593982006495718435145378299026339065911683941444368135841436240,
            17651103249881295769360621083089867327795409932421765340995240523916134206224
        ];
        uint256[4] memory publicSignals = [
            20478758922204220638474336583613263343311259753947562038905485593301959092125,
            9671001851733547979877655529610064780870338459602503202838120521919844559225,
            12437788904154107305991402511294433929676821840346488537363351117039537012895,
            16397740673538020963275628444227541070585946904532707688663110938877467368234
        ];
        privTreasury.withdraw(0, a, b, c, publicSignals);
    }
}
