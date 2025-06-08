// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AdminControl
 * @dev Centralized access control for CDA Coin system
 */
contract AdminControl is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant RESET_MANAGER_ROLE = keccak256("RESET_MANAGER_ROLE");
    bytes32 public constant NODE_REWARD_ROLE = keccak256("NODE_REWARD_ROLE");

    event RoleGrantedWithReason(bytes32 indexed role, address indexed account, string reason);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(RESET_MANAGER_ROLE, msg.sender);
        _grantRole(NODE_REWARD_ROLE, msg.sender);
    }

    /**
     * @dev Grant role with reason for audit trail
     */
    function grantRoleWithReason(
        bytes32 role,
        address account,
        string calldata reason
    ) external onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
        emit RoleGrantedWithReason(role, account, reason);
    }

    /**
     * @dev Check if address has admin privileges
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    /**
     * @dev Check if address can mint tokens
     */
    function canMint(address account) external view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }

    /**
     * @dev Check if address can reset system
     */
    function canReset(address account) external view returns (bool) {
        return hasRole(RESET_MANAGER_ROLE, account);
    }

    /**
     * @dev Check if address can distribute node rewards
     */
    function canDistributeNodeRewards(address account) external view returns (bool) {
        return hasRole(NODE_REWARD_ROLE, account);
    }
}
