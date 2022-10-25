/* Verifies that the manager knows the correct private key to withdraw a deposit
*/

pragma circom 2.0.3;

include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/bitify.circom";


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

    component mulResult = EscalarMul(253);
    mulResult.P[0] <== P[0];
    mulResult.P[1] <== P[1];

    var i;
    for (i=0; i<253; i++) {
        mulResult.e[i] <== managerPrivBits.out[i];
    }

    Q[0] === mulResult.out[0];
    Q[1] === mulResult.out[1];
}


/* Performs scalar multiplication of a point on Babyjubjub

   Modified version of EscalarMulFix() in escalarmulfix.circom
   that supports scalar multiplication of an arbitrary point on 
   the curve, not just the Base Point. 

   Input signals: 
      P: input point in twisted format, base 10
      e: binary representation of scalar
   
   Output signals:
      out: resulting point in twisted format, base 10

 */
template EscalarMul(n) {
    signal input P[2];    
    signal input e[n];    
    signal output out[2]; 

    var nsegments = (n-1)\246 +1; 
    var nlastsegment = n - (nsegments-1)*249;

    component segments[nsegments];

    component m2e[nsegments-1];
    component adders[nsegments-1];

    var s;
    var i;
    var nseg;
    var nWindows;

    for (s=0; s<nsegments; s++) {

        nseg = (s < nsegments-1) ? 249 : nlastsegment;
        nWindows = ((nseg - 1)\3)+1;

        segments[s] = SegmentMulFix(nWindows);

        for (i=0; i<nseg; i++) {
            segments[s].e[i] <== e[s*249+i];
        }

        for (i = nseg; i<nWindows*3; i++) {
            segments[s].e[i] <== 0;
        }

        if (s==0) {
            segments[s].base[0] <== P[0];
            segments[s].base[1] <== P[1];
        } else {
            m2e[s-1] = Montgomery2Edwards();
            adders[s-1] = BabyAdd();

            segments[s-1].dbl[0] ==> m2e[s-1].in[0];
            segments[s-1].dbl[1] ==> m2e[s-1].in[1];

            m2e[s-1].out[0] ==> segments[s].base[0];
            m2e[s-1].out[1] ==> segments[s].base[1];

            if (s==1) {
                segments[s-1].out[0] ==> adders[s-1].x1;
                segments[s-1].out[1] ==> adders[s-1].y1;
            } else {
                adders[s-2].xout ==> adders[s-1].x1;
                adders[s-2].yout ==> adders[s-1].y1;
            }
            segments[s].out[0] ==> adders[s-1].x2;
            segments[s].out[1] ==> adders[s-1].y2;
        }
    }

    if (nsegments == 1) {
        segments[0].out[0] ==> out[0];
        segments[0].out[1] ==> out[1];
    } else {
        adders[nsegments-2].xout ==> out[0];
        adders[nsegments-2].yout ==> out[1];
    }
}

component main { public [ P, Q ] } = Main();
