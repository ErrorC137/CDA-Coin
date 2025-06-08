export interface CDAERC20 {
  // Add necessary properties and methods based on the contract
  batchDistributeRewards(recipients: string[], amounts: any[], reason: string, category: string): any
  distributeReward(recipient: string, amount: any, reason: string, category: string): any
  getCycleInfo(): any
  getRemainingAllocation(category: string): any
  balanceOf(account: string): any
  resetAnnualCycle(): any
  emergencyReset(): any
}

export interface CDAResetManager {
  // Add necessary properties and methods based on the contract
  getResetStatus(): any
  initiateReset(): any
}

export interface CDABadgeNFT {
  // Add necessary properties and methods based on the contract
  batchRecordActivity(users: string[], activityType: string, counts: any[]): any
  recordActivity(user: string, activityType: string, count: any): any
  getUserBadgeInfo(user: string): any
}

export interface SwagRedemption {
  // Add necessary properties and methods based on the contract
  redemptions(redemptionId: number): any
  swagItems(itemId: number): any
  on(event: string, listener: (...args: any[]) => void): any
}

export interface AdminControl {
  // Add necessary properties and methods based on the contract
  ADMIN_ROLE(): any
  MINTER_ROLE(): any
  RESET_MANAGER_ROLE(): any
  grantRoleWithReason(role: any, account: string, reason: string): any
  isAdmin(account: string): any
  canMint(account: string): any
  canReset(account: string): any
}
