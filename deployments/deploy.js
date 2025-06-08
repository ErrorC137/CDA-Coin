const { ethers } = require("hardhat")

async function main() {
  console.log("🚀 Starting CDA Coin deployment...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)

  // Fix: Use ethers.provider.getBalance instead of deployer.getBalance
  const initialBalance = await ethers.provider.getBalance(deployer.address)
  console.log("Account balance:", ethers.formatEther(initialBalance))

  // Deploy AdminControl first
  console.log("\n📋 Deploying AdminControl...")
  const AdminControl = await ethers.getContractFactory("AdminControl")
  const adminControl = await AdminControl.deploy()
  await adminControl.waitForDeployment()
  const adminControlAddress = await adminControl.getAddress()
  console.log("✅ AdminControl deployed to:", adminControlAddress)

  // Deploy CDA Token
  console.log("\n🪙 Deploying CDAERC20...")
  const CDAERC20 = await ethers.getContractFactory("CDAERC20")
  const cdaToken = await CDAERC20.deploy(adminControlAddress)
  await cdaToken.waitForDeployment()
  const cdaTokenAddress = await cdaToken.getAddress()
  console.log("✅ CDAERC20 deployed to:", cdaTokenAddress)

  // Deploy Badge NFT
  console.log("\n🏆 Deploying CDABadgeNFT...")
  const CDABadgeNFT = await ethers.getContractFactory("CDABadgeNFT")
  const badgeNFT = await CDABadgeNFT.deploy(adminControlAddress, cdaTokenAddress)
  await badgeNFT.waitForDeployment()
  const badgeNFTAddress = await badgeNFT.getAddress()
  console.log("✅ CDABadgeNFT deployed to:", badgeNFTAddress)

  // Deploy Swag Redemption
  console.log("\n🛍️ Deploying SwagRedemption...")
  const SwagRedemption = await ethers.getContractFactory("SwagRedemption")
  const swagRedemption = await SwagRedemption.deploy(adminControlAddress, cdaTokenAddress, badgeNFTAddress)
  await swagRedemption.waitForDeployment()
  const swagRedemptionAddress = await swagRedemption.getAddress()
  console.log("✅ SwagRedemption deployed to:", swagRedemptionAddress)

  // Deploy Reset Manager
  console.log("\n🔄 Deploying CDAResetManager...")
  const CDAResetManager = await ethers.getContractFactory("CDAResetManager")
  const resetManager = await CDAResetManager.deploy(adminControlAddress, cdaTokenAddress)
  await resetManager.waitForDeployment()
  const resetManagerAddress = await resetManager.getAddress()
  console.log("✅ CDAResetManager deployed to:", resetManagerAddress)

  // Setup permissions
  console.log("\n🔐 Setting up permissions...")

  // Grant minter role to badge NFT contract
  await adminControl.grantRoleWithReason(
    await adminControl.MINTER_ROLE(),
    badgeNFTAddress,
    "Badge NFT contract needs minting rights for CDA rewards",
  )
  console.log("✅ Granted MINTER_ROLE to BadgeNFT")

  // Grant minter role to deployer for initial setup
  await adminControl.grantRoleWithReason(
    await adminControl.MINTER_ROLE(),
    deployer.address,
    "Deployer needs minting rights for initial setup",
  )
  console.log("✅ Granted MINTER_ROLE to deployer")

  // Grant reset role to reset manager
  await adminControl.grantRoleWithReason(
    await adminControl.RESET_MANAGER_ROLE(),
    resetManagerAddress,
    "Reset manager contract needs reset rights",
  )
  console.log("✅ Granted RESET_MANAGER_ROLE to ResetManager")

  // Verify deployments
  console.log("\n🔍 Verifying deployments...")

  // Check CDA token initial state
  const cycleInfo = await cdaToken.getCycleInfo()
  console.log("Current cycle:", cycleInfo.cycle.toString())
  console.log("Total supply for cycle:", cycleInfo.totalSupply.toString())

  // Check remaining allocations
  const activityAllocation = await cdaToken.getRemainingAllocation("activity")
  const milestoneAllocation = await cdaToken.getRemainingAllocation("milestone")
  console.log("Activity allocation remaining:", ethers.formatEther(activityAllocation))
  console.log("Milestone allocation remaining:", ethers.formatEther(milestoneAllocation))

  // Test minting a small amount
  console.log("\n🧪 Testing token minting...")
  await cdaToken.distributeReward(deployer.address, ethers.parseEther("100"), "Deployment test reward", "activity")
  const finalBalance = await cdaToken.balanceOf(deployer.address)
  console.log("✅ Test mint successful. Deployer balance:", ethers.formatEther(finalBalance))

  console.log("\n🎉 Deployment completed successfully!")
  console.log("\n📋 Contract Addresses:")
  console.log("AdminControl:", adminControlAddress)
  console.log("CDAERC20:", cdaTokenAddress)
  console.log("CDABadgeNFT:", badgeNFTAddress)
  console.log("SwagRedemption:", swagRedemptionAddress)
  console.log("CDAResetManager:", resetManagerAddress)

  // Generate .env.local content for frontend
  console.log("\n📝 Environment Variables for Frontend:")
  console.log(`NEXT_PUBLIC_BADGE_NFT_ADDRESS=${badgeNFTAddress}`)
  console.log(`NEXT_PUBLIC_SWAG_REDEMPTION_ADDRESS=${swagRedemptionAddress}`)
  console.log(`NEXT_PUBLIC_RESET_MANAGER_ADDRESS=${resetManagerAddress}`)
  console.log(`NEXT_PUBLIC_ADMIN_CONTROL_ADDRESS=${adminControlAddress}`)
  console.log(`NEXT_PUBLIC_CHAIN_ID=31337`)
  console.log(`NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545`)

  return {
    adminControl,
    cdaToken,
    badgeNFT,
    swagRedemption,
    resetManager,
  }
}

// Handle deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })

module.exports = main
