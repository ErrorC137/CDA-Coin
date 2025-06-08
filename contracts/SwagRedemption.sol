// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./utils/AdminControl.sol";
import "./CDAERC20.sol";
import "./CDABadgeNFT.sol";

/**
 * @title SwagRedemption
 * @dev Burn CDA tokens to redeem merchandise
 */
contract SwagRedemption is Pausable, ReentrancyGuard {
    AdminControl public adminControl;
    CDAERC20 public cdaToken;
    CDABadgeNFT public badgeNFT;

    struct SwagItem {
        string name;
        string description;
        uint256 cdaCost;
        uint256 minBadgeLevel;
        uint256 totalSupply;
        uint256 remainingSupply;
        bool isActive;
        string imageURI;
    }

    struct Redemption {
        address user;
        uint256 itemId;
        uint256 timestamp;
        string shippingInfo;
        bool fulfilled;
    }

    mapping(uint256 => SwagItem) public swagItems;
    mapping(uint256 => Redemption) public redemptions;
    mapping(address => uint256[]) public userRedemptions;
    
    uint256 public nextItemId;
    uint256 public nextRedemptionId;

    // Events
    event SwagItemAdded(uint256 indexed itemId, string name, uint256 cdaCost, uint256 minBadgeLevel);
    event SwagItemUpdated(uint256 indexed itemId, string name, uint256 cdaCost, uint256 minBadgeLevel);
    event SwagRedeemed(uint256 indexed redemptionId, address indexed user, uint256 indexed itemId, uint256 cdaCost);
    event RedemptionFulfilled(uint256 indexed redemptionId, address indexed user);

    constructor(
        address _adminControl,
        address _cdaToken,
        address _badgeNFT
    ) {
        adminControl = AdminControl(_adminControl);
        cdaToken = CDAERC20(_cdaToken);
        badgeNFT = CDABadgeNFT(_badgeNFT);
        nextItemId = 1;
        nextRedemptionId = 1;
        
        _addDefaultSwagItems();
    }

    modifier onlyAdmin() {
        require(adminControl.isAdmin(msg.sender), "Not authorized");
        _;
    }

    /**
     * @dev Add default swag items
     */
    function _addDefaultSwagItems() internal {
        // T-Shirt - Level 1+
        swagItems[nextItemId] = SwagItem({
            name: "CDA T-Shirt",
            description: "Official CDA branded t-shirt",
            cdaCost: 500 * 10**18,
            minBadgeLevel: 1,
            totalSupply: 100,
            remainingSupply: 100,
            isActive: true,
            imageURI: "ipfs://QmTShirtImage"
        });
        emit SwagItemAdded(nextItemId, "CDA T-Shirt", 500 * 10**18, 1);
        nextItemId++;

        // Hoodie - Level 2+
        swagItems[nextItemId] = SwagItem({
            name: "CDA Hoodie",
            description: "Premium CDA hoodie",
            cdaCost: 1200 * 10**18,
            minBadgeLevel: 2,
            totalSupply: 50,
            remainingSupply: 50,
            isActive: true,
            imageURI: "ipfs://QmHoodieImage"
        });
        emit SwagItemAdded(nextItemId, "CDA Hoodie", 1200 * 10**18, 2);
        nextItemId++;

        // Notebook - Level 1+
        swagItems[nextItemId] = SwagItem({
            name: "CDA Notebook",
            description: "High-quality notebook with CDA branding",
            cdaCost: 200 * 10**18,
            minBadgeLevel: 1,
            totalSupply: 200,
            remainingSupply: 200,
            isActive: true,
            imageURI: "ipfs://QmNotebookImage"
        });
        emit SwagItemAdded(nextItemId, "CDA Notebook", 200 * 10**18, 1);
        nextItemId++;

        // Sticker Pack - Level 0 (anyone)
        swagItems[nextItemId] = SwagItem({
            name: "CDA Sticker Pack",
            description: "Collection of CDA stickers",
            cdaCost: 50 * 10**18,
            minBadgeLevel: 0,
            totalSupply: 500,
            remainingSupply: 500,
            isActive: true,
            imageURI: "ipfs://QmStickerImage"
        });
        emit SwagItemAdded(nextItemId, "CDA Sticker Pack", 50 * 10**18, 0);
        nextItemId++;

        // Exclusive Jacket - Level 4+
        swagItems[nextItemId] = SwagItem({
            name: "CDA Leader Jacket",
            description: "Exclusive jacket for CDA leaders",
            cdaCost: 2500 * 10**18,
            minBadgeLevel: 4,
            totalSupply: 20,
            remainingSupply: 20,
            isActive: true,
            imageURI: "ipfs://QmJacketImage"
        });
        emit SwagItemAdded(nextItemId, "CDA Leader Jacket", 2500 * 10**18, 4);
        nextItemId++;
    }

    /**
     * @dev Redeem swag item
     */
    function redeemSwag(
        uint256 itemId,
        string calldata shippingInfo
    ) external nonReentrant whenNotPaused {
        SwagItem storage item = swagItems[itemId];
        require(item.isActive, "Item not available");
        require(item.remainingSupply > 0, "Item out of stock");
        require(bytes(shippingInfo).length > 0, "Shipping info required");

        // Check badge level requirement
        if (item.minBadgeLevel > 0) {
            (uint256 userBadgeLevel,,,,,) = badgeNFT.getUserBadgeInfo(msg.sender);
            require(userBadgeLevel >= item.minBadgeLevel, "Insufficient badge level");
        }

        // Check CDA balance and burn tokens
        require(cdaToken.balanceOf(msg.sender) >= item.cdaCost, "Insufficient CDA balance");
        cdaToken.burnFrom(msg.sender, item.cdaCost);

        // Create redemption record
        redemptions[nextRedemptionId] = Redemption({
            user: msg.sender,
            itemId: itemId,
            timestamp: block.timestamp,
            shippingInfo: shippingInfo,
            fulfilled: false
        });

        userRedemptions[msg.sender].push(nextRedemptionId);
        item.remainingSupply--;

        emit SwagRedeemed(nextRedemptionId, msg.sender, itemId, item.cdaCost);
        nextRedemptionId++;
    }

    /**
     * @dev Mark redemption as fulfilled (admin only)
     */
    function fulfillRedemption(uint256 redemptionId) public onlyAdmin {
        Redemption storage redemption = redemptions[redemptionId];
        require(redemption.user != address(0), "Redemption not found");
        require(!redemption.fulfilled, "Already fulfilled");

        redemption.fulfilled = true;
        emit RedemptionFulfilled(redemptionId, redemption.user);
    }

    /**
     * @dev Batch fulfill redemptions
     */
    function batchFulfillRedemptions(uint256[] calldata redemptionIds) external onlyAdmin {
        for (uint256 i = 0; i < redemptionIds.length; i++) {
            fulfillRedemption(redemptionIds[i]);
        }
    }

    /**
     * @dev Add new swag item (admin only)
     */
    function addSwagItem(
        string calldata name,
        string calldata description,
        uint256 cdaCost,
        uint256 minBadgeLevel,
        uint256 totalSupply,
        string calldata imageURI
    ) external onlyAdmin {
        swagItems[nextItemId] = SwagItem({
            name: name,
            description: description,
            cdaCost: cdaCost,
            minBadgeLevel: minBadgeLevel,
            totalSupply: totalSupply,
            remainingSupply: totalSupply,
            isActive: true,
            imageURI: imageURI
        });

        emit SwagItemAdded(nextItemId, name, cdaCost, minBadgeLevel);
        nextItemId++;
    }

    /**
     * @dev Update swag item (admin only)
     */
    function updateSwagItem(
        uint256 itemId,
        string calldata name,
        string calldata description,
        uint256 cdaCost,
        uint256 minBadgeLevel,
        bool isActive,
        string calldata imageURI
    ) external onlyAdmin {
        SwagItem storage item = swagItems[itemId];
        require(bytes(item.name).length > 0, "Item not found");

        item.name = name;
        item.description = description;
        item.cdaCost = cdaCost;
        item.minBadgeLevel = minBadgeLevel;
        item.isActive = isActive;
        item.imageURI = imageURI;

        emit SwagItemUpdated(itemId, name, cdaCost, minBadgeLevel);
    }

    /**
     * @dev Restock swag item (admin only)
     */
    function restockItem(uint256 itemId, uint256 additionalSupply) external onlyAdmin {
        SwagItem storage item = swagItems[itemId];
        require(bytes(item.name).length > 0, "Item not found");

        item.totalSupply += additionalSupply;
        item.remainingSupply += additionalSupply;
    }

    /**
     * @dev Get all active swag items
     */
    function getActiveSwagItems() external view returns (
        uint256[] memory itemIds,
        string[] memory names,
        uint256[] memory costs,
        uint256[] memory minBadgeLevels,
        uint256[] memory remainingSupplies
    ) {
        uint256 activeCount = 0;
        
        // Count active items
        for (uint256 i = 1; i < nextItemId; i++) {
            if (swagItems[i].isActive && swagItems[i].remainingSupply > 0) {
                activeCount++;
            }
        }

        // Populate arrays
        itemIds = new uint256[](activeCount);
        names = new string[](activeCount);
        costs = new uint256[](activeCount);
        minBadgeLevels = new uint256[](activeCount);
        remainingSupplies = new uint256[](activeCount);

        uint256 index = 0;
        for (uint256 i = 1; i < nextItemId; i++) {
            if (swagItems[i].isActive && swagItems[i].remainingSupply > 0) {
                itemIds[index] = i;
                names[index] = swagItems[i].name;
                costs[index] = swagItems[i].cdaCost;
                minBadgeLevels[index] = swagItems[i].minBadgeLevel;
                remainingSupplies[index] = swagItems[i].remainingSupply;
                index++;
            }
        }
    }

    /**
     * @dev Get user's redemption history
     */
    function getUserRedemptions(address user) external view returns (
        uint256[] memory redemptionIds,
        uint256[] memory itemIds,
        uint256[] memory timestamps,
        bool[] memory fulfilled
    ) {
        uint256[] memory userRedemptionIds = userRedemptions[user];
        uint256 length = userRedemptionIds.length;

        redemptionIds = new uint256[](length);
        itemIds = new uint256[](length);
        timestamps = new uint256[](length);
        fulfilled = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 redemptionId = userRedemptionIds[i];
            Redemption memory redemption = redemptions[redemptionId];
            
            redemptionIds[i] = redemptionId;
            itemIds[i] = redemption.itemId;
            timestamps[i] = redemption.timestamp;
            fulfilled[i] = redemption.fulfilled;
        }
    }

    /**
     * @dev Check if user can redeem item
     */
    function canUserRedeemItem(address user, uint256 itemId) external view returns (
        bool canRedeem,
        string memory reason
    ) {
        SwagItem memory item = swagItems[itemId];
        
        if (!item.isActive) {
            return (false, "Item not available");
        }
        
        if (item.remainingSupply == 0) {
            return (false, "Item out of stock");
        }
        
        if (cdaToken.balanceOf(user) < item.cdaCost) {
            return (false, "Insufficient CDA balance");
        }
        
        if (item.minBadgeLevel > 0) {
            (uint256 userBadgeLevel,,,,,) = badgeNFT.getUserBadgeInfo(user);
            if (userBadgeLevel < item.minBadgeLevel) {
                return (false, "Insufficient badge level");
            }
        }
        
        return (true, "");
    }

    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
}
