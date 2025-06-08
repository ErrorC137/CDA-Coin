// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "./utils/AdminControl.sol";
import "./CDAERC20.sol";

/**
 * @title CDAResetManager
 * @dev Manages annual reset of CDA system
 */
contract CDAResetManager is Pausable {
    AdminControl public adminControl;
    CDAERC20 public cdaToken;

    uint256 public constant RESET_COOLDOWN = 300 days; // ~10 months
    uint256 public lastResetTimestamp;
    bool public resetInProgress;

    // Events
    event ResetInitiated(uint256 timestamp, address initiator);
    event ResetCompleted(uint256 timestamp, uint256 newCycle);
    event EmergencyResetTriggered(uint256 timestamp, address admin);

    constructor(address _adminControl, address _cdaToken) {
        adminControl = AdminControl(_adminControl);
        cdaToken = CDAERC20(_cdaToken);
        lastResetTimestamp = block.timestamp;
    }

    modifier onlyAdmin() {
        require(adminControl.isAdmin(msg.sender), "Not authorized");
        _;
    }

    modifier onlyResetManager() {
        require(adminControl.canReset(msg.sender), "Not authorized to reset");
        _;
    }

    /**
     * @dev Check if reset is allowed (August only)
     */
    function canReset() public view returns (bool allowed, string memory reason) {
        if (resetInProgress) {
            return (false, "Reset already in progress");
        }

        if (block.timestamp < lastResetTimestamp + RESET_COOLDOWN) {
            return (false, "Too early for reset - must wait 10 months");
        }

        // Simplified August check - in production, use more robust date checking
        uint256 currentMonth = ((block.timestamp / 86400 + 4) / 7) % 52;
        if (currentMonth < 30 || currentMonth > 35) {
            return (false, "Can only reset in August");
        }

        return (true, "Reset allowed");
    }

    /**
     * @dev Initiate annual reset
     */
    function initiateReset() external onlyResetManager whenNotPaused {
        (bool allowed, string memory reason) = canReset();
        require(allowed, reason);

        resetInProgress = true;
        emit ResetInitiated(block.timestamp, msg.sender);

        // Trigger reset on CDA token contract
        cdaToken.resetAnnualCycle();

        _completeReset();
    }

    /**
     * @dev Complete the reset process
     */
    function _completeReset() internal {
        lastResetTimestamp = block.timestamp;
        resetInProgress = false;

        (uint256 currentCycle,,,) = cdaToken.getCycleInfo();
        emit ResetCompleted(block.timestamp, currentCycle);
    }

    /**
     * @dev Emergency reset (admin only, bypasses time restrictions)
     */
    function emergencyReset(string calldata reason) external onlyAdmin {
        require(bytes(reason).length > 0, "Reason required for emergency reset");

        resetInProgress = true;
        emit EmergencyResetTriggered(block.timestamp, msg.sender);

        // Trigger emergency reset on CDA token contract
        cdaToken.emergencyReset();

        _completeReset();
    }

    /**
     * @dev Get reset status information
     */
    function getResetStatus() external view returns (
        bool canResetNow,
        string memory resetReason,
        uint256 daysUntilEligible,
        uint256 lastReset,
        bool inProgress
    ) {
        (canResetNow, resetReason) = canReset();
        
        uint256 nextEligibleTime = lastResetTimestamp + RESET_COOLDOWN;
        if (block.timestamp >= nextEligibleTime) {
            daysUntilEligible = 0;
        } else {
            daysUntilEligible = (nextEligibleTime - block.timestamp) / 86400;
        }

        return (canResetNow, resetReason, daysUntilEligible, lastResetTimestamp, resetInProgress);
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
