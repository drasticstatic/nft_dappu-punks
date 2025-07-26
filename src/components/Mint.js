/**
 * @title Mint Component - NFT Minting Interface
 * @dev This component provides the user interface for minting NFTs
 *
 * Features:
 * - Single NFT minting with payment validation
 * - Transaction status feedback and error handling
 * - Loading states during blockchain transactions
 * - Integration with MetaMask for transaction signing
 *
 * Props:
 * @param provider - Ethers.js provider for blockchain connection
 * @param nft - NFT contract instance for calling mint function
 * @param cost - Cost to mint one NFT (in wei)
 * @param setIsLoading - Function to trigger data refresh after minting
 */

// React hooks for state management
import { useState } from 'react';

// Bootstrap components for form UI
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

/**
 * @dev Mint component that handles NFT minting functionality
 * @param props Object containing provider, nft contract, cost, and loading setter
 * @return JSX element representing the minting interface
 */
const Mint = ({ provider, nft, cost, setIsLoading }) => {
  // State to track if a minting transaction is in progress
  const [isWaiting, setIsWaiting] = useState(false)

  // Enhanced mint handler with better error handling and user feedback
  const mintHandler = async (e) => {
    e.preventDefault()

    // Check if wallet is connected and provider is available
    if (!provider || !nft) {
      window.alert('Please connect your wallet first')
      return
    }

    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).mint(1, { value: cost })

      // Show transaction submitted message
      console.log('Transaction submitted:', transaction.hash)

      // Wait for transaction confirmation
      await transaction.wait()

      // Show success message
      window.alert('NFT minted successfully!')

    } catch (error) {
      console.error('Minting error:', error)

      // Provide more specific error messages
      if (error.code === 4001) {
        window.alert('Transaction rejected by user')
      } else if (error.message.includes('insufficient funds')) {
        window.alert('Insufficient funds to complete the transaction')
      } else if (error.message.includes('execution reverted')) {
        window.alert('Transaction failed. Please check if minting is allowed and you have enough ETH.')
      } else {
        window.alert('Transaction failed. Please try again.')
      }
    }

    setIsWaiting(false)
    setIsLoading(true) // Reload blockchain data to update NFT count
  }

  return(
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
      {isWaiting ? (
        <div className="text-center">
          <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
          <p className="mt-3">Minting your NFT...</p>
          <small className="text-muted">Please confirm the transaction in your wallet</small>
        </div>
      ) : (
        <Form.Group>
          <Button
            variant="primary"
            type="submit"
            style={{ width: '100%' }}
            disabled={!provider || !nft}
          >
            Mint NFT
          </Button>
        </Form.Group>
      )}

    </Form>
  )
}

export default Mint;
