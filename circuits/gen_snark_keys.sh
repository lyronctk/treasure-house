### Boilerplate circuit compilation and vkey/zkey generation for development

# Powers of tau selection for Hermez Rollup
PTAU=../artifacts/circom/hermezptau.blob.core.windows.net_ptau_powersOfTau28_hez_final_15.ptau

# Compile circuit and create necessary intermediate files 
circom verif-manager.circom --r1cs --wasm
mv verif-manager_js/verif-manager.wasm .
rm -r verif-manager_js

# Generate zkey
yarn run snarkjs groth16 setup verif-manager.r1cs $PTAU verif-manager.zkey

# Export verification key
yarn run snarkjs zkey export verificationkey verif-manager.zkey verif-manager.vkey.json

# Verify protocol transcript, zkey
yarn run snarkjs zkey verify verif-manager.r1cs $PTAU verif-manager.zkey
