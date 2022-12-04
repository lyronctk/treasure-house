/* 
 * Validates withdrawal request by checking 1) knowledge of the correct private 
 * key for the given leaf and 2) knowledge of a valid Merkle inclusion proof for 
 * the given root.  
 */

pragma circom 2.0.3;

include "node_modules/maci-circuits/node_modules/circomlib/circuits/babyjub.circom";
include "node_modules/maci-circuits/node_modules/circomlib/circuits/bitify.circom";
include "node_modules/maci-circuits/node_modules/circomlib/circuits/comparators.circom";
include "node_modules/maci-circuits/node_modules/circomlib/circuits/escalarmulany.circom";
include "node_modules/maci-circuits/circom/poseidon/poseidonHashT6.circom";
include "node_modules/maci-circuits/circom/trees/incrementalMerkleTree.circom";

/* 

    Input signals: 
        v: Value of deposit, denominated in Wei
        root: Root of the Merkle tree, saved in contract
        leafIndex: Index of the leaf that is to be withdrawn
        P: Contributor's public key, base 10
        Q: Shared secret, base 10
        treasuryPriv: Treasury's private key
        pathIndex: Indices along the path of the Merkle proof
        pathElements: Paired elements along the path of the Merkle proof 

    @dev:
        - Skips verification of any leaves with v = 0

 */
template Main(MAX_N_WITHDRAW, MERKLE_TREE_DEPTH) {
    signal input v[MAX_N_WITHDRAW];
    signal input root;
    signal input leafIndex[MAX_N_WITHDRAW];

    signal input P[MAX_N_WITHDRAW][2];
    signal input Q[MAX_N_WITHDRAW][2];
    signal input treasuryPriv;

    signal input pathIndex[MAX_N_WITHDRAW][MERKLE_TREE_DEPTH];
    signal input pathElements[MAX_N_WITHDRAW][MERKLE_TREE_DEPTH][1];

    component treasuryPrivBits = Num2Bits(253);
    treasuryPrivBits.in <== treasuryPriv;

    component mulResults[MAX_N_WITHDRAW];
    component hashers[MAX_N_WITHDRAW];
    component inclusionProofs[MAX_N_WITHDRAW];
    for (var i = 0; i < MAX_N_WITHDRAW; i++) {
        // Check for correct secret key, P * α = Q
        mulResults[i] = EscalarMulAny(253);
        mulResults[i].p[0] <== P[i][0];
        mulResults[i].p[1] <== P[i][1];

        var j;
        for (j=0; j<253; j++) {
            mulResults[i].e[j] <== treasuryPrivBits.out[j];
        }

        Q[i][0] === mulResults[i].out[0];
        Q[i][1] === mulResults[i].out[1];

        // Check public leafIndex consistent with the provided proof
        leafIndex[i] === pathIndex[i][0];

        // Check merkle inclusion proof
        hashers[i] = PoseidonHashT6();
        hashers[i].inputs[0] <== P[i][0];
        hashers[i].inputs[1] <== P[i][1];
        hashers[i].inputs[2] <== Q[i][0];
        hashers[i].inputs[3] <== Q[i][1];
        hashers[i].inputs[4] <== v[i];

        inclusionProofs[i] = MerkleTreeInclusionProof(MERKLE_TREE_DEPTH);
        inclusionProofs[i].leaf <== hashers[i].out;
        inclusionProofs[i].path_index <== pathIndex[i];
        inclusionProofs[i].path_elements <== pathElements[i];

        root === inclusionProofs[i].root;
    }
}

component main { public [ v, root, leafIndex ] } = Main(5, 32);
