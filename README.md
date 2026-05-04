# Dapp Punks NFT Collection

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat)](https://drasticstatic.github.io/nft_dappu-punks)
[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey?style=flat)](https://github.com/drasticstatic/.github)

**[→ View Live Demo](https://drasticstatic.github.io/nft_dappu-punks)**

> **Note:** The live demo runs against a local Hardhat node. NFT minting requires the local node running with contracts deployed. The collection gallery and minting interface are fully explorable without a wallet.

A decentralized application (DApp) for minting and managing NFT collections 🌠

## ✨ Project Overview

Dapp Punks is an ERC721 NFT collection that allows users to:
- Connect their MetaMask wallet
- Mint unique NFT tokens with IPFS metadata storage
- View their complete NFT collection
- Interact with smart contracts through a user-friendly React interface

### Key Features 🔑

- **Smart Wallet Integration**: Automatic MetaMask connection with account change detection
- **Real-time NFT Display**: View all owned NFTs with automatic updates when minting or switching accounts
- **Comprehensive Testing**: Full test suite covering all smart contract functionality
- **IPFS Integration**: Decentralized metadata and image storage
- **Error Handling**: User-friendly error messages and transaction feedback

## Screenshots

### Main Application:
![DAPP Punks Main Screen](/screenshots/main-screen.png)

## 🛠 Technology Stack

- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: React, Bootstrap, Ethers.js
- **Blockchain**: Ethereum (Local Hardhat Network)
- **Storage**: IPFS for metadata and images
- **Testing**: Hardhat Test Framework with Chai
- **Development**: Node.js, npm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MetaMask** browser extension
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nft_dappu-punks
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The project is configured to work with Hardhat's local blockchain network. No additional environment variables are required for local development.

##  📒 Deployment Instructions 🧑‍🏫

### Step 1: Start Local Blockchain

Open a terminal and start the Hardhat local blockchain:

```bash
npx hardhat node
```

This will:
- Start a local Ethereum network on `http://localhost:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys for testing

**Keep this terminal running throughout development.**

### Step 2: Deploy Smart Contract

In a new terminal, deploy the NFT contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Compile the smart contract
- Deploy to the local network
- Display the contract address
- Set up initial contract parameters (cost, supply, metadata URI)

### Step 3: Configure MetaMask

1. **Add Local Network to MetaMask**:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account**:
   - Copy a private key from the Hardhat node output
   - Import it into MetaMask for testing

### Step 4: Start Frontend Application 🚀

In a new terminal, start the React development server:

```bash
npm run start
```

The application will open at `http://localhost:3000`

## 🧪 Testing

Run the comprehensive test suite to ensure all functionality works correctly:

```bash
# Run all tests
npx hardhat test

# Run tests with gas reporting
GAS_REPORT=true npx hardhat test

# Run specific test file
npx hardhat test test/NFT.js
```

The test suite covers:
- Contract deployment and initialization
- NFT minting functionality (success and failure cases)
- Ownership and balance tracking
- Withdrawal functionality
- Error handling and edge cases

## 📱 Using the Application

### 1. Connect Wallet
- Click "Connect Wallet" in the navigation bar
- Approve the MetaMask connection request
- Your wallet address will appear-truncated and display "connected"

### 2. Mint NFTs
- Ensure you have sufficient ETH for minting
- Click the "Mint NFT" button
- Confirm the transaction in MetaMask
- Wait for transaction confirmation

### 3. View Your Collection
- Your owned NFTs will automatically appear after minting
- Switch MetaMask accounts to see different collections
- Yout personal NFT display updates automatically when a new NFT is minted

### 4. Account Switching
- The app automatically detects when you switch MetaMask accounts
- Your NFT collection updates immediately
- No page refresh required

## 📁 Project Structure

```
nft_dappu-punks/
├── contracts/
│   └── NFT.sol                 # ERC721 NFT smart contract
├── scripts/
│   └── deploy.js              # Contract deployment script
├── test/
│   └── NFT.js                 # Comprehensive test suite
├── src/
│   ├── components/
│   │   ├── App.js             # Main application component
│   │   ├── Navigation.js      # Wallet connection & navigation
│   │   ├── Mint.js            # NFT minting functionality
│   │   ├── Data.js            # Contract data display
│   │   └── Loading.js         # Loading state component
│   ├── abis/                  # Contract ABI files
│   ├── config.json            # Network configuration
│   └── index.css              # Custom styling
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🐛 Troubleshooting

### Common Issues ⚠️

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check that you're connected to the correct network (Hardhat Local)
   - Try refreshing the page and reconnecting

2. **Transaction Failures**
   - Ensure you have sufficient ETH for gas fees
   - Check that the contract is deployed and accessible
   - Verify you're on the correct network

3. **NFT Images Not Loading**
   - Check your internet connection
   - Verify IPFS gateway is accessible
   - Images may take time to load from IPFS

4. **Test Failures**
   - Ensure no other Hardhat node is running
   - Clean compile: `npx hardhat clean && npx hardhat compile`
   - Check Node.js version compatibility

### 🙋 Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Review the terminal output for deployment errors
3. Ensure all prerequisites are installed correctly
4. Verify network configuration in MetaMask

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments 📚

- [Hardhat](https://hardhat.org/) for the development environment
- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [React](https://reactjs.org/) for the frontend framework
- [Bootstrap](https://getbootstrap.com/) for UI components
- [Ethers.js](https://docs.ethers.io/) for blockchain interaction
- [IPFS](https://ipfs.io/) for decentralized storage

## 👷🏼 Happy Building 🥳!
For questions or support, please open an issue in the 'nft_dappu-punks' repository

