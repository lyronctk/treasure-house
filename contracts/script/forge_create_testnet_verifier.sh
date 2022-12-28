forge create src/ManagerVerifier.sol:Verifier \
    --rpc-url $ETH_RPC_URL_GOERLI \
    --private-key $ETH_BURNER_PRIV_KEY \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify
