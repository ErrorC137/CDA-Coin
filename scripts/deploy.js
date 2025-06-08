const { ethers } = require("hardhat")

async function main() {
  console.log("🚀 Starting CDA Coin deployment...")

  // Get the ContractFactory instances
  const AdminControl = await ethers.getContractFactory("AdminControl")
  const CDAERC20 = await ethers.getContractFactory("CDAERC20")
  const CDABadgeNFT = await ethers.getContractFactory("CDABadgeNFT")
  const SwagRedemption = await ethers.getContractFactory("SwagRedemption")
  const CDAResetManager = await ethers.getContractFactory("CDAResetManager")

  // Deploy contracts
  console.log("Deploying AdminControl...")
  const adminControl = await AdminControl.deploy()
  await adminControl.waitForDeployment()
  const adminControlAddress = await adminControl.getAddress()
  console.log("AdminControl deployed to:", adminControlAddress)

  console.log("Deploying CDAERC20...")
  const cdaToken = await CDAERC20.deploy(adminControlAddress)
  await cdaToken.waitForDeployment()
  const cdaTokenAddress = await cdaToken.getAddress()
  console.log("CDAERC20 deployed to:", cdaTokenAddress)

  console.log("Deploying CDABadgeNFT...")
  const badgeNFT = await CDABadgeNFT.deploy(adminControlAddress, cdaTokenAddress)
  await badgeNFT.waitForDeployment()
  const badgeNFTAddress = await badgeNFT.getAddress()
  console.log("CDABadgeNFT deployed to:", badgeNFTAddress)

  console.log("Deploying SwagRedemption...")
  const swagRedemption = await SwagRedemption.deploy(adminControlAddress, cdaTokenAddress, badgeNFTAddress)
  await swagRedemption.waitForDeployment()
  const swagRedemptionAddress = await swagRedemption.getAddress()
  console.log("SwagRedemption deployed to:", swagRedemptionAddress)

  console.log("Deploying CDAResetManager...")
  const resetManager = await CDAResetManager.deploy(adminControlAddress, cdaTokenAddress)
  await resetManager.waitForDeployment()
  const resetManagerAddress = await resetManager.getAddress()
  console.log("CDAResetManager deployed to:", resetManagerAddress)

  console.log("\n🎉 All contracts deployed successfully!")
  console.log("\n📋 Contract Addresses:")
  console.log("AdminControl:", adminControlAddress)
  console.log("CDAERC20:", cdaTokenAddress)
  console.log("CDABadgeNFT:", badgeNFTAddress)
  console.log("SwagRedemption:", swagRedemptionAddress)
  console.log("CDAResetManager:", resetManagerAddress)

  console.log("\n📝 Add these to your .env.local:")
  console.log(`NEXT_PUBLIC_BADGE_NFT_ADDRESS=${badgeNFTAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
