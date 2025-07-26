// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Import OpenZeppelin contracts for NFT functionality and ownership management
import "./ERC721Enumerable.sol";  // Provides ERC721 NFT standard with enumeration capabilities
import "./Ownable.sol";           // Provides ownership functionality with access control

/**
 * @title NFT - Dapp Punks NFT Collection
 * @dev This contract implements an ERC721 NFT collection with the following features:
 * - Minting functionality with payment requirements
 * - Time-based minting control (can set when minting is allowed)
 * - Maximum supply limit to create scarcity
 * - IPFS metadata integration for decentralized storage
 * - Owner-only functions for contract management
 * - Enumerable functionality to track and query NFTs by owner
 */
contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;  // Allows us to convert numbers to strings

    // State variables that define the NFT collection properties
    string public baseURI;           // Base IPFS URI where metadata is stored
    string public baseExtension = ".json";  // File extension for metadata files
    uint256 public cost;             // Price in wei (smallest ETH unit) to mint one NFT
    uint256 public maxSupply;        // Maximum number of NFTs that can ever be minted
    uint256 public allowMintingOn;   // Timestamp when minting becomes available

    // Events are emitted when important actions occur, allowing frontend to listen for updates
    event Mint(uint256 amount, address minter);      // Fired when NFTs are minted
    event Withdraw(uint256 amount, address owner);   // Fired when contract owner withdraws funds

    /**
     * @dev Constructor function that runs once when the contract is deployed
     * @param _name The name of the NFT collection (e.g., "Dapp Punks")
     * @param _symbol The symbol/ticker for the collection (e.g., "DPUNK")
     * @param _cost The price in wei to mint one NFT
     * @param _maxSupply The maximum number of NFTs that can be minted
     * @param _allowMintingOn Unix timestamp when minting becomes available
     * @param _baseURI The base IPFS URI where NFT metadata is stored
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI
    ) ERC721(_name, _symbol) {  // Initialize the parent ERC721 contract
        cost = _cost;                    // Set the minting price
        maxSupply = _maxSupply;          // Set the maximum supply limit
        allowMintingOn = _allowMintingOn; // Set when minting is allowed to start
        baseURI = _baseURI;              // Set the IPFS base URI for metadata
    }

    /**
     * @dev Public function that allows users to mint NFTs by paying the required cost
     * @param _mintAmount The number of NFTs the user wants to mint
     *
     * Requirements:
     * - Current time must be after the allowMintingOn timestamp
     * - Must mint at least 1 NFT
     * - Must send enough ETH to cover the cost
     * - Cannot exceed the maximum supply
     */
    function mint(uint256 _mintAmount) public payable {
        // Check if minting is currently allowed (time-based restriction)
        require(block.timestamp >= allowMintingOn, "Minting not yet allowed");

        // Ensure user is trying to mint at least 1 NFT
        require(_mintAmount > 0, "Must mint at least 1 NFT");

        // Check if user sent enough ETH (msg.value is the ETH sent with transaction)
        require(msg.value >= cost * _mintAmount, "Insufficient payment");

        // Get current total number of minted NFTs
        uint256 supply = totalSupply();

        // Ensure minting won't exceed the maximum supply
        require(supply + _mintAmount <= maxSupply, "Would exceed max supply");

        // Mint the requested number of NFTs to the sender's address
        // Loop starts at 1 because token IDs start from 1, not 0
        for(uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);  // Safely mint NFT with incremental ID
        }

        // Emit an event to notify that minting occurred (useful for frontend updates)
        emit Mint(_mintAmount, msg.sender);
    }

    /**
     * @dev Returns the metadata URI for a specific NFT token
     * This function constructs the full IPFS URL for the NFT's metadata
     * Example return: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
     * @param _tokenId The ID of the token to get metadata for
     * @return The complete IPFS URI pointing to the token's metadata JSON file
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        // Ensure the token exists before returning its URI
        require(_exists(_tokenId), 'Token does not exist');

        // Combine baseURI + tokenId + baseExtension to create full metadata URL
        // abi.encodePacked efficiently concatenates strings
        return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }

    /**
     * @dev Returns an array of all token IDs owned by a specific address
     * This is very useful for displaying a user's complete NFT collection
     * @param _owner The address to query NFTs for
     * @return An array of token IDs owned by the specified address
     */
    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        // Get the total number of NFTs owned by this address
        uint256 ownerTokenCount = balanceOf(_owner);

        // Create an array to store the token IDs
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);

        // Loop through and collect all token IDs owned by this address
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);  // Get token ID by index
        }

        return tokenIds;  // Return the complete array of owned token IDs
    }

    // ========== OWNER-ONLY FUNCTIONS ==========
    // These functions can only be called by the contract owner (deployer)

    /**
     * @dev Allows the contract owner to withdraw all ETH from the contract
     * This is how the project creators collect the funds from NFT sales
     * Only the owner can call this function (enforced by onlyOwner modifier)
     */
    function withdraw() public onlyOwner {
        // Get the total ETH balance stored in this contract
        uint256 balance = address(this).balance;

        // Transfer all ETH to the owner's address
        // Using call{value: balance}("") is the recommended way to send ETH
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");  // Ensure the transfer succeeded

        // Emit an event to log the withdrawal
        emit Withdraw(balance, msg.sender);
    }

    /**
     * @dev Allows the contract owner to update the minting cost
     * This can be useful for adjusting price based on demand or market conditions
     * @param _newCost The new price in wei for minting one NFT
     */
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;  // Update the minting cost
    }

}
