pragma circom 2.0.3;

template Main() {
    signal input G;
    signal input privKey;
    signal input pubKey;

    G * privKey === pubKey; 
}

component main { public [ G, pubKey] } = Main();
