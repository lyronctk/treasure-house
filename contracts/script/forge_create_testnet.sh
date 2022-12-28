# ==
# Deploy PrivateTreasury.sol to Goerli
# ==

# Merkle tree depth
TREE_DEPTH=32

# Keccak256 hash of 'Maci'
NOTHING_UP_MY_SLEEVE=8370432830353022751713833565135785980866757267633941821328460903436894336785

# Max number of leaves that can be withdrawn at a time.
MAX_N_WITHDRAW=5

# Address of SNARK verifier
VERIFIER=0xac71523A21Dd82C7645Edec341e90022aDF51F98

# Reminder: set addresses of poseidon hash funcs in PrivateTreasury.sol before 
#           running
forge create src/PrivateTreasury.sol:PrivateTreasury \
    --rpc-url $ETH_RPC_URL_GOERLI \
    --private-key $ETH_BURNER_PRIV_KEY \
    --constructor-args $TREE_DEPTH $NOTHING_UP_MY_SLEEVE $MAX_N_WITHDRAW $VERIFIER \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify
