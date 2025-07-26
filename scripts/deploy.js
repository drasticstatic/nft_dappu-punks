/**
 * @title NFT Deployment Script
 * @dev This script deploys the Dapp Punks NFT contract to the blockchain
 *
 * How to run this script:
 * 1. For local deployment: npx hardhat run scripts/deploy.js --network localhost
 * 2. For testnet deployment: npx hardhat run scripts/deploy.js --network goerli
 *
 * Make sure to:
 * - Have a local Hardhat node running (npx hardhat node) for local deployment
 * - Configure your network settings in hardhat.config.js for other networks
 * - Have sufficient ETH in your deployer account for gas fees
 */

// Import Hardhat Runtime Environment for blockchain interaction
const hre = require("hardhat");

/**
 * @dev Main deployment function that sets up and deploys the NFT contract
 */
async function main() {
  // ========== CONTRACT CONFIGURATION ==========
  // These parameters define the characteristics of your NFT collection

  const NAME = 'Dapp Punks'  // The full name of your NFT collection
  const SYMBOL = 'DP'        // Short symbol/ticker (usually 2-5 characters)

  // Cost to mint one NFT (10 ETH in this example)
  // parseUnits converts human-readable ETH amount to wei (smallest ETH unit)
  const COST = ethers.utils.parseUnits('10', 'ether')

  const MAX_SUPPLY = 25      // Maximum number of NFTs that can ever be minted

  // Set minting to be available 1 minute from now (60000 milliseconds)
  // Date.now() gives current timestamp, we add 60 seconds and convert to Unix timestamp
  const NFT_MINT_DATE = (Date.now() + 60000).toString().slice(0, 10)

  // IPFS base URI where NFT metadata and images are stored
  // This should point to a folder containing numbered JSON files (1.json, 2.json, etc.)
  const IPFS_METADATA_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  console.log('Deploying NFT contract with the following parameters:')
  console.log(`Name: ${NAME}`)
  console.log(`Symbol: ${SYMBOL}`)
  console.log(`Cost: ${ethers.utils.formatEther(COST)} ETH`)
  console.log(`Max Supply: ${MAX_SUPPLY}`)
  console.log(`Mint Date: ${new Date(NFT_MINT_DATE * 1000)}`)
  console.log(`Metadata URI: ${IPFS_METADATA_URI}\n`)

  // ========== CONTRACT DEPLOYMENT ==========

  // Get the contract factory (blueprint for creating contract instances)
  const NFT = await hre.ethers.getContractFactory('NFT')

  // Deploy the contract with our configuration parameters
  // This creates a new instance of the contract on the blockchain
  let nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, NFT_MINT_DATE, IPFS_METADATA_URI)

  // Wait for the deployment transaction to be mined and confirmed
  await nft.deployed()

  // Log the successful deployment with the contract address
  console.log(`✅ NFT contract deployed successfully!`)
  console.log(`📍 Contract Address: ${nft.address}`)
  console.log(`🔗 Add this address to your frontend config.json file\n`)

  // Additional deployment information
  console.log('Next steps:')
  console.log('1. Copy the contract address above')
  console.log('2. Update src/config.json with the new contract address')
  console.log('3. Start your frontend: npm start')
  console.log('4. Connect MetaMask and start minting!')
}

// ========== SCRIPT EXECUTION ==========
// This pattern allows us to use async/await and properly handle any errors
main()
  .then(() => {
    console.log('\n🎉 Deployment completed successfully!')
    process.exit(0)  // Exit with success code
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:')
    console.error(error)
    process.exit(1)  // Exit with error code
  })
