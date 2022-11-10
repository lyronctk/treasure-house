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

        // uint256[2] memory a = [
        //     0x056ef8d26e7953b34b88fd59443e8c514e985e699f8a0ff03eefc3ecaa4ab221,
        //     0x17d1ccd468c6f30b19bc313eb7e600b3ff72465e8f24ad64142194b51e4830f1
        // ];
        // uint256[2][2] memory b = [
        //     [
        //         0x1abd6fd0c5cc7ed6f81dd3a40efa14013fd3d28c7a89c2dc730ab58a43bc1a5d,
        //         0x16dc4e30577e5ab18e4e79a40a2e889e9ad4bbaeea89ec0497a1b8747b47fced
        //     ],
        //     [
        //         0x2460c621817fcb0ed76ee96098314e8b5dc892813b351494c637fa874d5d19a7,
        //         0x00fbaa27823555629825fa0b30dd8df6cba3234e057ec1046299e78278278c1f
        //     ]
        // ];
        // uint256[2] memory c = [
        //     0x1d51f6de2128a7da2c74afe8fcdf1c98950c931456a80eb09591064dbb016ddd,
        //     0x2883decb3d52494492fb9f0e5ebe8fa754f19c09aaa141d983499c57d25638f1
        // ];
        // uint256[4] memory publicSignals = [
        //     0x22dff0aa2ec7c5afa928b7633c4b1a628f94b871dedae21cc0cb7e77b0650767,
        //     0x0cb96b445fbde902cfccb43c7092917d377c2ff3fd4fe3d74a6bbe5328c256da,
        //     0x02941b4dfcdcebe808e541f303afd23a2b6b2614336fb4e56ea98f3a91d3d121,
        //     0x1a59e647e45b6d909f58303b67c353b7e673214b078351a95e6d09496161f041
        // ];
        // privTreasury.withdraw(0, a, b, c, publicSignals);

        bytes memory proof = '0x156b0acff96704dc22ee3e6eafe9a7adef48b7d62997e2adfea1e1e5b01d653a0d8ba5661bf61f5535f565cf5a62a05da098927d8da5ce9f80d89d1818d36e4a2016a88ffd55b5297c72d9c22705f1d370bbccc150c72135671e98e815942020144a1a294d3b99cf7f9efb57f0cac1e38714aa05431aee83676f5da4522636a32c3d962d2285b88e453ee412ac3ac86a50a47c7c2429d38c49fbcdbfad17ab66161e0dfb81ccce9461bec7bffca08e7936c8080b5128dff9a63643c443c4a9bb1597a1764ca1e25f05cf21e73e4f92e66b231f68c68c7da441083832dc8feab1265c3ff9c10ffd1f6f0100088cf79ad75c79f02ac1c2a6861767f2689d26acf02a9c3adbecb3fda9dfc2ba9ca06d8ce2968fba6d359079c1924c5d26b2e9c72d03c5d48ebcdc9694da5379e4fa1ce66283fc98b5eba26e89fbfc6e004ef4d27e2152406f2b213faad6e1f9a8c68b1159962dae5c68640059af9443f457e6b6510b3468c653e2e9bf7388c12609906b05d1ee2238cea19edc42d23cb7e7d6575602ace6d1ba3f83238571851092b6aa309882cb706299d84b8894c25a1cdae2c20b0f6af9b9dc566a431207f2676905cb160aa3187f41415af249c22e36daf30427cf22f78a5132390601544667785e734d7fc52d1d1fb8549c21f942cd8b10fa0037b1aaf43901174113547e3617521ac75efd1dd27feae748ed64d7b802df572ef19d30d5b2c4ade94ed95872b5214bff40c257ceeb020be41c2ee6b72c4f2e302b091bc7a1c74f6a1fc19c109586463488dfda1e46ca3d3ad7fdd3ba0928d921aa965a05b577dff8dfc574957da86c89eabd5460c9766a2ed0ff746973640f2d535fbde6618d80c0d1ba5bb78d0dce49ac043397ddc4b2bdd5c415c8d1af9c28330f7db8f9b42f06c148e16f2b8441e360d997f68bd7b2ecb112091b422b4f1f3324ea67e01807deb4403917f1ba20e608a22731f55bc82f138a1517c078f808af038db7a078f1e23759a58848b35790c256d7378fd443248734cccbdf32352f82869f7d43f378a74dd3c3ebec20eb4d02d31c38a1b69f0bbd0b863838a4212c4201d09c2de55570c37a94be9b1140382fa73fea0515bbd69b3bc82c5d0978';
        uint[] memory pubSignals = [
            0x22dff0aa2ec7c5afa928b7633c4b1a628f94b871dedae21cc0cb7e77b0650767,
            0x0cb96b445fbde902cfccb43c7092917d377c2ff3fd4fe3d74a6bbe5328c256da,
            0x02941b4dfcdcebe808e541f303afd23a2b6b2614336fb4e56ea98f3a91d3d121,
            0x1a59e647e45b6d909f58303b67c353b7e673214b078351a95e6d09496161f041
        ]
        privTreasury.withdraw(proof, pubSignals);
    }
}
