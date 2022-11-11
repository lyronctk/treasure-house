### Boilerplate circuit compilation and vkey/zkey generation for development

# Powers of tau selection for Hermez Rollup
PTAU=../artifacts/circom/hermezptau.blob.core.windows.net_ptau_powersOfTau28_hez_final_15.ptau

# Compile circuit and create necessary intermediate files 
circom verif-manager.circom --r1cs --wasm
mv verif-manager_js/verif-manager.wasm .
rm -r verif-manager_js

# Generate zkey
yarn run snarkjs plonk setup verif-manager.r1cs $PTAU verif-manager.plonk.zkey

# Export verification key
yarn run snarkjs zkey export verificationkey verif-manager.plonk.zkey verif-manager.plonk.vkey.json

# Export verifier to smart contract for on-chain verification
yarn run snarkjs zkey export solidityverifier verif-manager.plonk.zkey ManagerVerifierPlonk.sol
sed -i -e 's/0.6.11;/0.8.13;/g' ManagerVerifier.sol
mv ManagerVerifierPlonk.sol ../contracts/src
