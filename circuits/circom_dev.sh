### Boilerplate circuit compilation and vkey/zkey generation for development

# Powers of tau selection for Hermez Rollup
PTAU=../artifacts/circom/hermezptau.blob.core.windows.net_ptau_powersOfTau28_hez_final_15.ptau

# Compile circuit
circom verif-manager.circom --r1cs --wasm --c
mv verif-manager_js/verif-manager.wasm .
rm -r verif-manager_js ManagerVerifier.sol-e
export CPATH="$CPATH:/opt/homebrew/opt/nlohmann-json/include:/opt/homebrew/opt/gmp/include"

# Generate zkey
yarn run snarkjs groth16 setup verif-manager.r1cs $PTAU verif-manager.zkey

# Export verification key
yarn run snarkjs zkey export verificationkey verif-manager.zkey verif-manager.vkey.json

# Verify protocol transcript, zkey
yarn run snarkjs zkey verify verif-manager.r1cs $PTAU verif-manager.zkey

# Export verifier to smart contract for on-chain verification
yarn run snarkjs zkey export solidityverifier verif-manager.zkey ManagerVerifier.sol
sed -i -e 's/0.6.11;/0.8.13;/g' ManagerVerifier.sol
mv ManagerVerifier.sol ../contracts/src
