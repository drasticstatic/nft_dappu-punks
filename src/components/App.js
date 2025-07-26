/**
 * @title App Component - Main Application Container
 * @dev This is the root component of the Dapp Punks NFT application
 *
 * Key Features:
 * - Automatic MetaMask wallet connection and account switching detection
 * - Real-time NFT collection display for connected wallet
 * - Smart contract interaction for minting and data retrieval
 * - Responsive UI with loading states and error handling
 *
 * State Management:
 * - Blockchain connection state (provider, contract, account)
 * - NFT contract data (supply, cost, user's NFTs)
 * - UI state (loading, wallet connection status)
 */

// React hooks for state management and side effects
import { useEffect, useState } from 'react'

// Bootstrap components for responsive UI layout
import { Container, Row, Col } from 'react-bootstrap'

// Third-party component for countdown timer display
import Countdown from 'react-countdown'

// Ethers.js library for Ethereum blockchain interaction
import { ethers } from 'ethers'

// Static assets
import preview from '../preview.png';  // Preview image shown when user has no NFTs

// Custom React components
import Navigation from './Navigation';  // Top navigation bar with wallet connection
import Data from './Data';             // Displays contract data (supply, cost, etc.)
import Mint from './Mint';             // NFT minting interface
import Loading from './Loading';       // Loading spinner component

// Smart contract Application Binary Interface (ABI)
// This defines how to interact with the deployed NFT contract
import NFT_ABI from '../abis/NFT.json'

// Network configuration containing contract addresses for different networks
import config from '../config.json';

/**
 * @dev Main App component that orchestrates the entire application
 * @return JSX element representing the complete application UI
 */
function App() {
  // ========== STATE MANAGEMENT ==========

  // Blockchain connection state - manages Web3 provider and smart contract instances
  const [provider, setProvider] = useState(null)           // Ethers.js provider for blockchain connection
  const [nft, setNFT] = useState(null)                     // NFT contract instance
  const [account, setAccount] = useState(null)             // Currently connected wallet address
  const [isWalletConnected, setIsWalletConnected] = useState(false)  // Wallet connection status

  // NFT contract data state - stores information fetched from the smart contract
  const [revealTime, setRevealTime] = useState(0)          // Timestamp when minting becomes available
  const [maxSupply, setMaxSupply] = useState(0)            // Maximum number of NFTs that can be minted
  const [totalSupply, setTotalSupply] = useState(0)        // Current number of minted NFTs
  const [cost, setCost] = useState(0)                      // Cost to mint one NFT (in wei)
  const [balance, setBalance] = useState(0)                // Number of NFTs owned by connected account
  const [ownedNFTs, setOwnedNFTs] = useState([])           // Array of token IDs owned by connected account

  // UI state - manages loading states and user interface behavior
  const [isLoading, setIsLoading] = useState(true)         // Loading state for initial data fetch

  // Function to connect wallet - called when user clicks connect button
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)
        setIsWalletConnected(true)

        // Load blockchain data after connecting
        await loadBlockchainData(account)
      } catch (error) {
        console.error('Error connecting wallet:', error)
        window.alert('Failed to connect wallet. Please try again.')
      }
    } else {
      window.alert('MetaMask is not installed. Please install MetaMask to use this application.')
    }
  }

  // Function to load blockchain data - enhanced to handle account parameter
  const loadBlockchainData = async (userAccount = null) => {
    if (!window.ethereum) {
      console.error('MetaMask not found')
      return
    }

    try {
      // Initiate provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      // Initiate contract
      const nft = new ethers.Contract(config[31337].nft.address, NFT_ABI, provider)
      setNFT(nft)

      // Use provided account or fetch current account
      let currentAccount = userAccount
      if (!currentAccount) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          currentAccount = ethers.utils.getAddress(accounts[0])
          setAccount(currentAccount)
          setIsWalletConnected(true)
        } else {
          setIsLoading(false)
          return // No accounts connected, show connect button
        }
      }

      // Fetch contract data
      const allowMintingOn = await nft.allowMintingOn()
      setRevealTime(allowMintingOn.toString() + '000')

      setMaxSupply(await nft.maxSupply())
      setTotalSupply(await nft.totalSupply())
      setCost(await nft.cost())

      // Fetch user-specific data
      const userBalance = await nft.balanceOf(currentAccount)
      setBalance(userBalance)

      // Fetch all NFTs owned by the user using the walletOfOwner function
      const ownedTokenIds = await nft.walletOfOwner(currentAccount)
      setOwnedNFTs(ownedTokenIds.map(id => id.toString()))

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading blockchain data:', error)
      setIsLoading(false)
    }
  }

  // Effect to load initial blockchain data
  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading])

  // Effect to handle MetaMask account changes - auto-refresh when user switches accounts
  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          const newAccount = ethers.utils.getAddress(accounts[0])
          setAccount(newAccount)
          setIsWalletConnected(true)
          // Reload data for the new account
          loadBlockchainData(newAccount)
        } else {
          // User disconnected wallet
          setAccount(null)
          setIsWalletConnected(false)
          setBalance(0)
          setOwnedNFTs([])
        }
      }

      // Listen for chain changes (network changes)
      const handleChainChanged = () => {
        // Reload the page when chain changes to ensure proper state
        window.location.reload()
      }

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      // Cleanup function to remove event listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, []) // Empty dependency array means this effect runs once on mount


  return(
    <Container>
      <Navigation
        account={account}
        connectWallet={connectWallet}
        isWalletConnected={isWalletConnected}
      />

      <h1 className='my-4 text-center'>Dapp Punks</h1>

      {isLoading ? (
        <Loading />
      ) : !isWalletConnected ? (
        // Show wallet connection prompt when no wallet is connected
        <div className='text-center my-5 py-5'>
          <h3 className='mb-4'>Connect Your Wallet</h3>
          <p className='mb-4 text-muted'>
            Please connect your MetaMask wallet to interact with the Dapp Punks NFT collection.
          </p>
          <button
            className='btn btn-primary btn-lg btn-connect-wallet'
            onClick={connectWallet}
          >
            Connect MetaMask
          </button>
          <div className='mt-4'>
            <small className='text-muted'>
              Don't have MetaMask? <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">Download it here</a>
            </small>
          </div>
        </div>
      ) : (
        <>
          <Row>
            <Col>
              {/* Display owned NFTs or preview image */}
              {ownedNFTs.length > 0 ? (
                <div className='text-center'>
                  <h4 className='mb-4'>Your Collection ({ownedNFTs.length} NFT{ownedNFTs.length !== 1 ? 's' : ''})</h4>
                  <div className='d-flex flex-wrap justify-content-center gap-3'>
                    {ownedNFTs.map((tokenId) => (
                      <div key={tokenId} className='nft-item card' style={{ width: '220px' }}>
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${tokenId}.png`}
                          alt={`Dapp Punk #${tokenId}`}
                          className='card-img-top'
                          style={{ height: '220px', objectFit: 'cover' }}
                          onError={(e) => {
                            // Fallback to preview image if NFT image fails to load
                            e.target.src = preview;
                          }}
                        />
                        <div className='card-body p-2'>
                          <h6 className='card-title mb-1'>Dapp Punk #{tokenId}</h6>
                          <small className='text-muted'>Token ID: {tokenId}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-4'>
                    <small className='text-muted'>
                      Your NFTs are automatically updated when you mint new ones or switch accounts
                    </small>
                  </div>
                </div>
              ) : (
                <div className='text-center'>
                  <img src={preview} alt="Preview" className='img-fluid' style={{ maxWidth: '400px' }} />
                  <h5 className='mt-3'>No NFTs in your collection yet</h5>
                  <p className='text-muted'>Mint your first Dapp Punk to get started!</p>
                </div>
              )}
            </Col>

            <Col>
              <div className='my-4 text-center'>
                <Countdown date={parseInt(revealTime)} className='h2' />
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />

              <Mint
                provider={provider}
                nft={nft}
                cost={cost}
                setIsLoading={setIsLoading}
              />
            </Col>

          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
