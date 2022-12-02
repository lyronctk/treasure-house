/* 
 * Validates withdrawal request by checking 1) knowledge of the correct private 
 * key for the given leaf and 2) knowledge of a valid Merkle inclusion proof for 
 * the given root.  
 */

pragma circom 2.0.3;

include "node_modules/maci-circuits/node_modules/circomlib/circuits/babyjub.circom";
include "node_modules/maci-circuits/node_modules/circomlib/circuits/bitify.circom";
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

 */
template Main() {
    signal input v;
    signal input root;
    signal input leafIndex;

    signal input P[2];
    signal input Q[2];
    signal input treasuryPriv;

    signal input pathIndex[32];
    signal input pathElements[32][1];

    // Check for correct secret key, P * α = Q
    component treasuryPrivBits = Num2Bits(253);
    treasuryPrivBits.in <== treasuryPriv;

    component mulResult = EscalarMulAny(253);
    mulResult.p[0] <== P[0];
    mulResult.p[1] <== P[1];

    var i;
    for (i=0; i<253; i++) {
        mulResult.e[i] <== treasuryPrivBits.out[i];
    }

    Q[0] === mulResult.out[0];
    Q[1] === mulResult.out[1];

    // Check public leafIndex consistent with the provided proof
    leafIndex === pathIndex[0];

    // Check merkle inclusion proof (note: hard-codes tree depth of 32)
    component hasher = PoseidonHashT6();
    hasher.inputs[0] <== P[0];
    hasher.inputs[1] <== P[1];
    hasher.inputs[2] <== Q[0];
    hasher.inputs[3] <== Q[1];
    hasher.inputs[4] <== v;

    component inclusionProof = MerkleTreeInclusionProof(32);
    inclusionProof.leaf <== hasher.out;
    inclusionProof.path_index <== pathIndex;
    inclusionProof.path_elements <== pathElements;
    root === inclusionProof.root; 
}

component main { public [ v, root, leafIndex ] } = Main();
