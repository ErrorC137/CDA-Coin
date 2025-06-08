// Contract configuration - these are public blockchain addresses
export const CONTRACT_ADDRESSES = {
  CDA_TOKEN: process.env.NEXT_PUBLIC_CDA_TOKEN_ADDRESS || "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  BADGE_NFT: process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  SWAG_REDEMPTION: process.env.NEXT_PUBLIC_SWAG_REDEMPTION_ADDRESS || "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  RESET_MANAGER: process.env.NEXT_PUBLIC_RESET_MANAGER_ADDRESS || "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  ADMIN_CONTROL: process.env.NEXT_PUBLIC_ADMIN_CONTROL_ADDRESS || "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
} as const

export const NETWORK_CONFIG = {
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || "31337",
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
} as const

// Contract ABIs
export const CDA_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function getCycleInfo() view returns (uint256 cycle, uint256 resetTimestamp, uint256 totalSupply, uint256 daysUntilReset)",
  "function getRemainingAllocation(string category) view returns (uint256)",
  "function distributeReward(address to, uint256 amount, string reason, string category) external",
] as const

export const BADGE_NFT_ABI = [
  "function getUserBadgeInfo(address user) view returns (uint256 currentLevel, uint256[] badgeTokenIds, uint256 eventsAttended, uint256 volunteeredTimes, uint256 presentationsMade, uint256 projectsCompleted)",
  "function mintBadge(address to, uint256 level, string reason) external",
] as const
