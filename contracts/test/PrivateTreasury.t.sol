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
            11227055842227382250313944337260545174604239686553520888990763372589615536547,
            2089811607935798536982953230541220246701844909412605999043978720068276922654
        ];
        uint256[2][2] memory b = [
            [
                9697496822520370593327369503137350258636380093781660696690573806386480147390,
                20789090211557182592346711781784897666084406129129264966828795799719062720816
            ],
            [
                11163016405702079470691659322678666032202877373834008410868643644789753719186,
                8427424143987324321936601551638253361319118844834718476033540437914622624790
            ]
        ];
        uint256[2] memory c = [
            14491058183066446873500736678657409636886335638646375657291547434984677471712,
            9893119613790548317561895090425012326840990632042287792412457578779895610129
        ];
        uint256[4] memory publicSignals = [
            20478758922204220638474336583613263343311259753947562038905485593301959092125,
            9671001851733547979877655529610064780870338459602503202838120521919844559225,
            12437788904154107305991402511294433929676821840346488537363351117039537012895,
            16397740673538020963275628444227541070585946904532707688663110938877467368234
        ];
        assert(privTreasury.withdraw(0, a, b, c, publicSignals));
    }
}
