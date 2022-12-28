# ==
# Deploy PrivateTreasury.sol to local network
# ==

# Merkle tree depth
TREE_DEPTH=32

# Keccak256 hash of 'Maci'
NOTHING_UP_MY_SLEEVE=8370432830353022751713833565135785980866757267633941821328460903436894336785

# Max number of leaves that can be withdrawn at a time.
MAX_N_WITHDRAW=5

# Address of SNARK verifier
VERIFIER=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Addresses of poseidon hash functions
POSEIDON_T3=0x8464135c8F25Da09e49BC8782676a84730C318bC
POSEIDON_T6=0x71C95911E9a5D330f4D621842EC243EE1343292e

forge create src/PrivateTreasury.sol:PrivateTreasury \
    --rpc-url http://127.0.0.1:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --constructor-args $TREE_DEPTH $NOTHING_UP_MY_SLEEVE $MAX_N_WITHDRAW $VERIFIER
