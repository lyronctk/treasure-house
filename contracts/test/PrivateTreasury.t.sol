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
            5549254755504580910294686184933664807078462420116193780298228306723891250376,
            18281851154064502456407343580616848937798318896148307554717365819615438134171
        ];
        uint256[2] memory b_0 = [
            9894197104969991963988196979235763787048641239917531868630028584516981104072,
            3626664840150696036468671925935243575844909798247996374195629589669527327608
        ];
        uint256[2] memory b_1 = [
            21799360283102393912880569672337774617880953369099493450476606272043247323870,
            9786044022767523537995280674540882112580163071122157191342937584443113692545
        ];
        uint256[2] memory c = [
            11248985448686769773396465722021667590120274197481972979816044827352853520140,
            10644519165822708929218640512864795538827574848757057345323580099790219692456
        ];
        uint256[4] memory publicSignals = [
            15774304754517346999023497321201509567957605170442473579565850305913755600743,
            5755361220201469951081669037277658872481357368831662601834926264409919739610,
            1166307512450569711421700077089993034850807776181808973010238879186268967201,
            11918972791794991293572562615114461967155232349241363887599638220816085282881
        ];
        privTreasury.withdraw(0, publicSignals, a, b_0, b_1, c);
    }
}
