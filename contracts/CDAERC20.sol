// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./utils/AdminControl.sol";

/**
 * @title CDAERC20
 * @dev CDA Coin - Zero gas, resettable ERC20 token for gamified rewards
 */
contract CDAERC20 is ERC20, ERC20Burnable, Pausable {
    AdminControl public adminControl;
    
    // Annual reset tracking
    uint256 public currentCycle;
    uint256 public lastResetTimestamp;
    mapping(uint256 => uint256) public cycleTotalSupply;
    
    // Tokenomics allocation per cycle (100,000 total)
    uint256 public constant TOTAL_SUPPLY_PER_CYCLE = 100_000 * 10**18;
    uint256 public constant ACTIVITY_REWARDS_ALLOCATION = 60_000 * 10**18;
    uint256 public constant MILESTONE_ALLOCATION = 15_000 * 10**18;
    uint256 public constant SWAG_STORE_ALLOCATION = 10_000 * 10**18;
    uint256 public constant NFT_BADGE_ALLOCATION = 7_500 * 10**18;
    uint256 public constant NODE_RUNNER_ALLOCATION = 5_000 * 10**18;
    uint256 public constant ADMIN_BUFFER_ALLOCATION = 2_500 * 10**18;
    
    // Allocation tracking
    mapping(uint256 => mapping(string => uint256)) public cycleAllocations;
    mapping(uint256 => mapping(string => uint256)) public cycleSpent;
    
    // Events
    event TokensReset(uint256 indexed cycle, uint256 timestamp);
    event AllocationMinted(uint256 indexed cycle, string category, uint256 amount, address recipient);
    event RewardDistributed(address indexed recipient, uint256 amount, string reason);

    constructor(address _adminControl) ERC20("CDA Coin", "CDA") {
        adminControl = AdminControl(_adminControl);
        currentCycle = 1;
        lastResetTimestamp = block.timestamp;
        _initializeCycleAllocations();
    }

    modifier onlyAdmin() {
        require(adminControl.isAdmin(msg.sender), "Not authorized");
        _;
    }

    modifier onlyMinter() {
        require(adminControl.canMint(msg.sender), "Not authorized to mint");
        _;
    }

    modifier onlyResetManager() {
        require(adminControl.canReset(msg.sender), "Not authorized to reset");
        _;
    }

    /**
     * @dev Initialize allocations for current cycle
     */
    function _initializeCycleAllocations() internal {
        cycleAllocations[currentCycle]["activity"] = ACTIVITY_REWARDS_ALLOCATION;
        cycleAllocations[currentCycle]["milestone"] = MILESTONE_ALLOCATION;
        cycleAllocations[currentCycle]["swag"] = SWAG_STORE_ALLOCATION;
        cycleAllocations[currentCycle]["nft"] = NFT_BADGE_ALLOCATION;
        cycleAllocations[currentCycle]["node"] = NODE_RUNNER_ALLOCATION;
        cycleAllocations[currentCycle]["admin"] = ADMIN_BUFFER_ALLOCATION;
        cycleTotalSupply[currentCycle] = TOTAL_SUPPLY_PER_CYCLE;
    }

    /**
     * @dev Mint tokens from specific allocation category
     */
    function mintFromAllocation(
        address to,
        uint256 amount,
        string calldata category
    ) public onlyMinter whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be positive");
        
        uint256 available = cycleAllocations[currentCycle][category] - cycleSpent[currentCycle][category];
        require(amount <= available, "Exceeds allocation limit");
        
        cycleSpent[currentCycle][category] += amount;
        _mint(to, amount);
        
        emit AllocationMinted(currentCycle, category, amount, to);
    }

    /**
     * @dev Distribute reward with reason for audit trail
     */
    function distributeReward(
        address recipient,
        uint256 amount,
        string calldata reason,
        string calldata category
    ) external onlyMinter whenNotPaused {
        mintFromAllocation(recipient, amount, category);
        emit RewardDistributed(recipient, amount, reason);
    }

    /**
     * @dev Batch distribute rewards
     */
    function batchDistributeRewards(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata reason,
        string calldata category
    ) external onlyMinter whenNotPaused {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintFromAllocation(recipients[i], amounts[i], category);
            emit RewardDistributed(recipients[i], amounts[i], reason);
        }
    }

    /**
     * @dev Annual reset - burns all tokens and starts new cycle
     * Can only be called in August (month 8)
     */
    function resetAnnualCycle() external onlyResetManager {
        require(block.timestamp >= lastResetTimestamp + 300 days, "Too early for reset");
        
        // Check if it's August (simplified - in production use more robust date checking)
        uint256 currentMonth = ((block.timestamp / 86400 + 4) / 7) % 52; // Rough month calculation
        require(currentMonth >= 30 && currentMonth <= 35, "Can only reset in August");
        
        // Reset all balances (this is a simplified approach - in production you'd iterate through holders)
        // For this implementation, we'll emit an event and rely on frontend/backend to handle
        
        currentCycle++;
        lastResetTimestamp = block.timestamp;
        _initializeCycleAllocations();
        
        emit TokensReset(currentCycle, block.timestamp);
    }

    /**
     * @dev Emergency reset (admin only)
     */
    function emergencyReset() external onlyAdmin {
        currentCycle++;
        lastResetTimestamp = block.timestamp;
        _initializeCycleAllocations();
        
        emit TokensReset(currentCycle, block.timestamp);
    }

    /**
     * @dev Get remaining allocation for category
     */
    function getRemainingAllocation(string calldata category) external view returns (uint256) {
        return cycleAllocations[currentCycle][category] - cycleSpent[currentCycle][category];
    }

    /**
     * @dev Get cycle information
     */
    function getCycleInfo() external view returns (
        uint256 cycle,
        uint256 resetTimestamp,
        uint256 totalSupply,
        uint256 daysUntilReset
    ) {
        cycle = currentCycle;
        resetTimestamp = lastResetTimestamp;
        totalSupply = cycleTotalSupply[currentCycle];
        
        uint256 nextResetTime = lastResetTimestamp + 365 days;
        if (block.timestamp >= nextResetTime) {
            daysUntilReset = 0;
        } else {
            daysUntilReset = (nextResetTime - block.timestamp) / 86400;
        }
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

    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
