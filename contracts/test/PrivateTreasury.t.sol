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
            17476756999839178991645733852146867145628639398331766829588523251890710087819,
            272389635976812042020314222812278816492354312810889437575539362700456510254
        ];
        uint256[2][2] memory b = [
            [
                15059761415223263823442891278293159463138642221362427745537451946147477803367,
                4439674643489383541013008885249634175856332527366944033994088017780188099093
            ],
            [
                3836362405926827224445650153466150531567973962818615713037611417193630963445,
                15142382833123534539335973795594078488193468701287965760303460641133768900937
            ]
        ];
        uint256[2] memory c = [
            20023710699145284918989801810709663828754385013458196747537540311502573563278,
            11150873731829333241638217555629588298783274055124094665729446474722548036173
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
