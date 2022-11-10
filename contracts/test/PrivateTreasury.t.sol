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
                hex"22dff0aa2ec7c5afa928b7633c4b1a628f94b871dedae21cc0cb7e77b0650767"
            ),
            bytes32(
                hex"0cb96b445fbde902cfccb43c7092917d377c2ff3fd4fe3d74a6bbe5328c256da"
            )
        );
        PrivateTreasury.Point memory Q = PrivateTreasury.Point(
            bytes32(
                hex"02941b4dfcdcebe808e541f303afd23a2b6b2614336fb4e56ea98f3a91d3d121"
            ),
            bytes32(
                hex"1a59e647e45b6d909f58303b67c353b7e673214b078351a95e6d09496161f041"
            )
        );
        privTreasury.deposit{value: 100000000000000000}(P, Q);

        uint256[2] memory a = [
            912614365867109922957295191565852054766008042756559111226237484658595128652,
            11827253151574719504099426098550329237849242551719190338463763622956802890152
        ];
        uint256[2][2] memory b = [
            [
                7427914395756489013639499947704128302731687144037169379082874432870847476463,
                13415698321313055773729779117758471203963677874695649127769868526881306719039
            ],
            [
                16916802939614055427262933022785337370212560617973635838963434616281717784949,
                21743004133502548183225103992763894489617359335636329905699214014848229064644
            ]
        ];
        uint256[2] memory c = [
            6840247691876542347099257853315099784002154465281705935650879758414954058951,
            6364673211096437635311341453553483080312355170572092964762177631292863803433
        ];
        uint256[4] memory publicSignals = [
            15774304754517346999023497321201509567957605170442473579565850305913755600743,
            5755361220201469951081669037277658872481357368831662601834926264409919739610,
            1166307512450569711421700077089993034850807776181808973010238879186268967201,
            11918972791794991293572562615114461967155232349241363887599638220816085282881
        ];
        privTreasury.withdraw(0, a, b, c, publicSignals);
    }
}
