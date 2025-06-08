// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BadgeLevels
 * @dev Defines badge levels and requirements for CDA system
 */
library BadgeLevels {
    struct BadgeRequirement {
        uint256 eventsAttended;
        uint256 volunteeredTimes;
        uint256 presentationsMade;
        uint256 projectsCompleted;
        uint256 cdaReward;
        string name;
        string description;
    }

    /**
     * @dev Get badge requirements for a specific level
     */
    function getBadgeRequirement(uint256 level) internal pure returns (BadgeRequirement memory) {
        if (level == 1) {
            return BadgeRequirement({
                eventsAttended: 5,
                volunteeredTimes: 0,
                presentationsMade: 0,
                projectsCompleted: 0,
                cdaReward: 100,
                name: "Newcomer",
                description: "Attended 5 events"
            });
        } else if (level == 2) {
            return BadgeRequirement({
                eventsAttended: 10,
                volunteeredTimes: 3,
                presentationsMade: 0,
                projectsCompleted: 0,
                cdaReward: 250,
                name: "Helper",
                description: "Attended 10 events and volunteered 3 times"
            });
        } else if (level == 3) {
            return BadgeRequirement({
                eventsAttended: 15,
                volunteeredTimes: 5,
                presentationsMade: 2,
                projectsCompleted: 1,
                cdaReward: 500,
                name: "Contributor",
                description: "Active contributor with presentations"
            });
        } else if (level == 4) {
            return BadgeRequirement({
                eventsAttended: 25,
                volunteeredTimes: 10,
                presentationsMade: 5,
                projectsCompleted: 3,
                cdaReward: 1000,
                name: "Leader",
                description: "Community leader and mentor"
            });
        } else if (level == 5) {
            return BadgeRequirement({
                eventsAttended: 40,
                volunteeredTimes: 20,
                presentationsMade: 10,
                projectsCompleted: 5,
                cdaReward: 2000,
                name: "Champion",
                description: "CDA Champion - highest level"
            });
        }
        
        revert("Invalid badge level");
    }

    /**
     * @dev Check if user qualifies for a badge level
     */
    function qualifiesForBadge(
        uint256 level,
        uint256 eventsAttended,
        uint256 volunteeredTimes,
        uint256 presentationsMade,
        uint256 projectsCompleted
    ) internal pure returns (bool) {
        BadgeRequirement memory req = getBadgeRequirement(level);
        
        return eventsAttended >= req.eventsAttended &&
               volunteeredTimes >= req.volunteeredTimes &&
               presentationsMade >= req.presentationsMade &&
               projectsCompleted >= req.projectsCompleted;
    }

    /**
     * @dev Get maximum badge level (5)
     */
    function getMaxLevel() internal pure returns (uint256) {
        return 5;
    }
}
