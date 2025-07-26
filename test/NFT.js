/**
 * @title NFT Contract Test Suite
 * @dev Comprehensive tests for the Dapp Punks NFT contract
 *
 * This test suite covers:
 * - Contract deployment and initialization
 * - NFT minting functionality (success and failure scenarios)
 * - Ownership and balance tracking
 * - Withdrawal functionality
 * - Error handling and edge cases
 *
 * How to run tests:
 * - All tests: npx hardhat test
 * - With gas reporting: GAS_REPORT=true npx hardhat test
 * - Specific test file: npx hardhat test test/NFT.js
 */

// Import testing framework and Hardhat environment
const { expect } = require('chai');    // Assertion library for testing
const { ethers } = require('hardhat'); // Ethereum library for blockchain interaction

/**
 * @dev Helper function to convert ETH amounts to wei (smallest ETH unit)
 * @param n The amount in ETH to convert
 * @return The amount in wei as a BigNumber
 */
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Alias for better readability when dealing with ETH amounts
const ether = tokens

/**
 * @dev Main test suite for the NFT contract
 * Tests are organized into logical groups (Deployment, Minting, etc.)
 */
describe('NFT', () => {
  // ========== TEST CONFIGURATION ==========
  // These constants define the parameters used throughout the tests

  const NAME = 'Dapp Punks'        // NFT collection name
  const SYMBOL = 'DP'              // NFT collection symbol
  const COST = ether(10)           // Cost to mint one NFT (10 ETH)
  const MAX_SUPPLY = 25            // Maximum number of NFTs that can be minted
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'  // IPFS metadata URI

  // Test account variables
  let nft,        // The deployed NFT contract instance
      deployer,   // Account that deploys the contract (becomes owner)
      minter      // Account used for testing minting functionality

  /**
   * @dev Setup function that runs before each test
   * Gets test accounts from Hardhat's local blockchain
   */
  beforeEach(async () => {
    let accounts = await ethers.getSigners()  // Get available test accounts
    deployer = accounts[0]  // First account becomes the contract deployer/owner
    minter = accounts[1]    // Second account is used for minting tests
  })

  /**
   * @dev Test group for contract deployment and initialization
   * Verifies that the contract is deployed correctly with proper parameters
   */
  describe('Deployment', () => {
    // Set minting to be allowed 2 minutes from now (for testing time restrictions)
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10)

    /**
     * @dev Deploy a fresh contract instance before each deployment test
     * This ensures each test starts with a clean state
     */
    beforeEach(async () => {
      // Get the contract factory (blueprint for creating contract instances)
      const NFT = await ethers.getContractFactory('NFT')

      // Deploy the contract with test parameters
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
    })

    /**
     * @dev Test that the contract stores the correct collection name
     */
    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    /**
     * @dev Test that the contract stores the correct collection symbol
     */
    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    /**
     * @dev Test that the contract stores the correct minting cost
     */
    it('returns the cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    /**
     * @dev Test that the contract stores the correct maximum supply
     */
    it('returns the maximum total supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns the base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns the owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })

  })


  describe('Minting', () => {
    let transaction, result

    describe('Success', async () => {

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('returns the address of the minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('returns total number of tokens the minter owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
        // Uncomment this line to see example
        // console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint')
          .withArgs(1, minter.address)
      })

    })

    describe('Failure', async () => {

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(0, { value: COST })).to.be.reverted
      })

      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

      it('does not allow more NFTs to be minted than max amount', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(100, { value: COST })).to.be.reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.tokenURI('99')).to.be.reverted
      })


    })

  })

  describe('Displaying NFTs', () => {
    let transaction, result

    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

      // Mint 3 nfts
      transaction = await nft.connect(minter).mint(3, { value: ether(30) })
      result = await transaction.wait()
    })

    it('returns all the NFTs for a given owner', async () => {
      let tokenIds = await nft.walletOfOwner(minter.address)
      // Uncomment this line to see the return value
      // console.log("owner wallet", tokenIds)
      expect(tokenIds.length).to.equal(3)
      expect(tokenIds[0].toString()).to.equal('1')
      expect(tokenIds[1].toString()).to.equal('2')
      expect(tokenIds[2].toString()).to.equal('3')
    })


  })

  describe('Minting', () => {

    describe('Success', async () => {

      let transaction, result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })

      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
      })

      it('emits a withdraw event', async () => {
        expect(transaction).to.emit(nft, 'Withdraw')
          .withArgs(COST, deployer.address)
      })
    })

    describe('Failure', async () => {

      it('prevents non-owner from withdrawing', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })
    })
  })
})
