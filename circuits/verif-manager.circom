/* 
 * Verifies that the manager knows the correct private key to withdraw a deposit
 */

pragma circom 2.0.3;

include "node_modules/circomlib/circuits/babyjub.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/escalarmulany.circom";

/* Checks whether manager knows private key to derive Q from P

   Contributors to the treasury include P & Q when making deposits. P is the 
   contributor's public key (contribSecret * G). Q is the shared secret created 
   via Diffie-Hellman key exchange (contribSecret * managerPublic = 
   contribSecret * managerSecret * G). This template verifies that the manager
   knows the correct managerSecret to derive Q from P. 

   Input signals: 
      P: contributor's public key, base 10
      Q: shared secret, base 10
      managerPriv: manager's private key

 */
template Main() {
    signal input P[2];
    signal input Q[2];
    signal input managerPriv;

    component managerPrivBits = Num2Bits(253);
    managerPrivBits.in <== managerPriv;

    component mulResult = EscalarMulAny(253);
    mulResult.p[0] <== P[0];
    mulResult.p[1] <== P[1];

    var i;
    for (i=0; i<253; i++) {
        mulResult.e[i] <== managerPrivBits.out[i];
    }

    Q[0] === mulResult.out[0];
    Q[1] === mulResult.out[1];
}

component main { public [ P, Q ] } = Main();
