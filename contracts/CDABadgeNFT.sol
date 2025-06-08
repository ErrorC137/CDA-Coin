// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./utils/AdminControl.sol";
import "./utils/BadgeLevels.sol";
import "./CDAERC20.sol";

/**
 * @title CDABadgeNFT
 * @dev Soulbound NFT badges for CDA system achievements
 */
contract CDABadgeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable {
    using Counters for Counters.Counter;
    using BadgeLevels for uint256;

    AdminControl public adminControl;
    CDAERC20 public cdaToken;
    Counters.Counter private _tokenIdCounter;

    // User activity tracking
    struct UserActivity {
        uint256 eventsAttended;
        uint256 volunteeredTimes;
        uint256 presentationsMade;
        uint256 projectsCompleted;
        uint256 currentBadgeLevel;
        uint256[] badgeTokenIds;
    }

    mapping(address => UserActivity) public userActivities;
    mapping(uint256 => uint256) public tokenIdToBadgeLevel;
    mapping(address => mapping(uint256 => bool)) public userHasBadgeLevel;

    // Badge metadata
    mapping(uint256 => string) public badgeLevelURIs;

    // Events
    event ActivityRecorded(address indexed user, string activityType, uint256 newCount);
    event BadgeMinted(address indexed user, uint256 indexed tokenId, uint256 badgeLevel, uint256 cdaReward);
    event BadgeLevelURISet(uint256 indexed level, string uri);

    constructor(
        address _adminControl,
        address _cdaToken
    ) ERC721("CDA Badge", "CDABADGE") {
        adminControl = AdminControl(_adminControl);
        cdaToken = CDAERC20(_cdaToken);
        
        // Set default badge URIs (these would be IPFS URIs in production)
        badgeLevelURIs[1] = "ipfs://QmNewcomerBadge";
        badgeLevelURIs[2] = "ipfs://QmHelperBadge";
        badgeLevelURIs[3] = "ipfs://QmContributorBadge";
        badgeLevelURIs[4] = "ipfs://QmLeaderBadge";
        badgeLevelURIs[5] = "ipfs://QmChampionBadge";
    }

    modifier onlyAdmin() {
        require(adminControl.isAdmin(msg.sender), "Not authorized");
        _;
    }

    modifier onlyMinter() {
        require(adminControl.canMint(msg.sender), "Not authorized to mint");
        _;
    }

    /**
     * @dev Record user activity and check for badge eligibility
     */
    function recordActivity(
        address user,
        string calldata activityType,
        uint256 count
    ) public onlyMinter whenNotPaused {
        UserActivity storage activity = userActivities[user];
        
        if (keccak256(bytes(activityType)) == keccak256(bytes("event"))) {
            activity.eventsAttended += count;
            emit ActivityRecorded(user, activityType, activity.eventsAttended);
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("volunteer"))) {
            activity.volunteeredTimes += count;
            emit ActivityRecorded(user, activityType, activity.volunteeredTimes);
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("presentation"))) {
            activity.presentationsMade += count;
            emit ActivityRecorded(user, activityType, activity.presentationsMade);
        } else if (keccak256(bytes(activityType)) == keccak256(bytes("project"))) {
            activity.projectsCompleted += count;
            emit ActivityRecorded(user, activityType, activity.projectsCompleted);
        }
        
        _checkAndMintBadges(user);
    }

    /**
     * @dev Batch record activities
     */
    function batchRecordActivity(
        address[] calldata users,
        string calldata activityType,
        uint256[] calldata counts
    ) external onlyMinter whenNotPaused {
        require(users.length == counts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            recordActivity(users[i], activityType, counts[i]);
        }
    }

    /**
     * @dev Check if user qualifies for new badges and mint them
     */
    function _checkAndMintBadges(address user) internal {
        UserActivity storage activity = userActivities[user];
        
        for (uint256 level = activity.currentBadgeLevel + 1; level <= BadgeLevels.getMaxLevel(); level++) {
            if (BadgeLevels.qualifiesForBadge(
                level,
                activity.eventsAttended,
                activity.volunteeredTimes,
                activity.presentationsMade,
                activity.projectsCompleted
            ) && !userHasBadgeLevel[user][level]) {
                _mintBadge(user, level);
                activity.currentBadgeLevel = level;
            } else {
                break; // Stop checking higher levels if current level not achieved
            }
        }
    }

    /**
     * @dev Mint a badge NFT for user
     */
    function _mintBadge(address user, uint256 badgeLevel) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, badgeLevelURIs[badgeLevel]);
        
        tokenIdToBadgeLevel[tokenId] = badgeLevel;
        userHasBadgeLevel[user][badgeLevel] = true;
        userActivities[user].badgeTokenIds.push(tokenId);
        
        // Award CDA tokens for badge achievement
        BadgeLevels.BadgeRequirement memory req = BadgeLevels.getBadgeRequirement(badgeLevel);
        if (req.cdaReward > 0) {
            cdaToken.mintFromAllocation(user, req.cdaReward, "nft");
        }
        
        emit BadgeMinted(user, tokenId, badgeLevel, req.cdaReward);
    }

    /**
     * @dev Manually mint badge (admin only)
     */
    function adminMintBadge(address user, uint256 badgeLevel) external onlyAdmin {
        require(badgeLevel >= 1 && badgeLevel <= BadgeLevels.getMaxLevel(), "Invalid badge level");
        require(!userHasBadgeLevel[user][badgeLevel], "User already has this badge");
        
        _mintBadge(user, badgeLevel);
        if (badgeLevel > userActivities[user].currentBadgeLevel) {
            userActivities[user].currentBadgeLevel = badgeLevel;
        }
    }

    /**
     * @dev Get user's badge information
     */
    function getUserBadgeInfo(address user) external view returns (
        uint256 currentLevel,
        uint256[] memory badgeTokenIds,
        uint256 eventsAttended,
        uint256 volunteeredTimes,
        uint256 presentationsMade,
        uint256 projectsCompleted
    ) {
        UserActivity memory activity = userActivities[user];
        return (
            activity.currentBadgeLevel,
            activity.badgeTokenIds,
            activity.eventsAttended,
            activity.volunteeredTimes,
            activity.presentationsMade,
            activity.projectsCompleted
        );
    }

    /**
     * @dev Get next badge requirements for user
     */
    function getNextBadgeRequirement(address user) external view returns (
        uint256 nextLevel,
        string memory name,
        string memory description,
        uint256 eventsNeeded,
        uint256 volunteersNeeded,
        uint256 presentationsNeeded,
        uint256 projectsNeeded
    ) {
        uint256 currentLevel = userActivities[user].currentBadgeLevel;
        uint256 nextBadgeLevel = currentLevel + 1;
        
        if (nextBadgeLevel > BadgeLevels.getMaxLevel()) {
            return (0, "Max Level Reached", "You have achieved the highest badge level!", 0, 0, 0, 0);
        }
        
        BadgeLevels.BadgeRequirement memory req = BadgeLevels.getBadgeRequirement(nextBadgeLevel);
        UserActivity memory activity = userActivities[user];
        
        return (
            nextBadgeLevel,
            req.name,
            req.description,
            req.eventsAttended > activity.eventsAttended ? req.eventsAttended - activity.eventsAttended : 0,
            req.volunteeredTimes > activity.volunteeredTimes ? req.volunteeredTimes - activity.volunteeredTimes : 0,
            req.presentationsMade > activity.presentationsMade ? req.presentationsMade - activity.presentationsMade : 0,
            req.projectsCompleted > activity.projectsCompleted ? req.projectsCompleted - activity.projectsCompleted : 0
        );
    }

    /**
     * @dev Set badge level URI (admin only)
     */
    function setBadgeLevelURI(uint256 level, string calldata uri) external onlyAdmin {
        require(level >= 1 && level <= BadgeLevels.getMaxLevel(), "Invalid badge level");
        badgeLevelURIs[level] = uri;
        emit BadgeLevelURISet(level, uri);
    }

    /**
     * @dev Override transfer to make badges soulbound (non-transferable)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        require(from == address(0) || to == address(0), "Soulbound: Transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
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

    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
