async function main() {
  console.log("🚀 Starting CDA Coin deployment...")

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)

  const balance = await deployer.getBalance()
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH")

  // Deploy AdminControl first
  console.log("\n📋 Deploying AdminControl...")
  const AdminControl = await hre.ethers.getContractFactory("AdminControl")
  const adminControl = await AdminControl.deploy()
  await adminControl.deployed()
  console.log("✅ AdminControl deployed to:", adminControl.address)

  // Deploy CDA Token
  console.log("\n🪙 Deploying CDAERC20...")
  const CDAERC20 = await hre.ethers.getContractFactory("CDAERC20")
  const cdaToken = await CDAERC20.deploy(adminControl.address)
  await cdaToken.deployed()
  console.log("✅ CDAERC20 deployed to:", cdaToken.address)

  // Deploy Badge NFT
  console.log("\n🏆 Deploying CDABadgeNFT...")
  const CDABadgeNFT = await hre.ethers.getContractFactory("CDABadgeNFT")
  const badgeNFT = await CDABadgeNFT.deploy(adminControl.address, cdaToken.address)
  await badgeNFT.deployed()
  console.log("✅ CDABadgeNFT deployed to:", badgeNFT.address)

  // Deploy Swag Redemption
  console.log("\n🛍️ Deploying SwagRedemption...")
  const SwagRedemption = await hre.ethers.getContractFactory("SwagRedemption")
  const swagRedemption = await SwagRedemption.deploy(adminControl.address, cdaToken.address, badgeNFT.address)
  await swagRedemption.deployed()
  console.log("✅ SwagRedemption deployed to:", swagRedemption.address)

  // Deploy Reset Manager
  console.log("\n🔄 Deploying CDAResetManager...")
  const CDAResetManager = await hre.ethers.getContractFactory("CDAResetManager")
  const resetManager = await CDAResetManager.deploy(adminControl.address, cdaToken.address)
  await resetManager.deployed()
  console.log("✅ CDAResetManager deployed to:", resetManager.address)

  console.log("\n🎉 All contracts deployed successfully!")
  console.log("\n📋 Contract Addresses:")
  console.log("AdminControl:", adminControl.address)
  console.log("CDAERC20:", cdaToken.address)
  console.log("CDABadgeNFT:", badgeNFT.address)
  console.log("SwagRedemption:", swagRedemption.address)
  console.log("CDAResetManager:", resetManager.address)

  console.log("\n📝 Add these to your .env.local:")
  console.log(`NEXT_PUBLIC_BADGE_NFT_ADDRESS=${badgeNFT.address}`)
  console.log(`NEXT_PUBLIC_SWAG_REDEMPTION_ADDRESS=${swagRedemption.address}`)
  console.log(`NEXT_PUBLIC_RESET_MANAGER_ADDRESS=${resetManager.address}`)
  console.log(`NEXT_PUBLIC_ADMIN_CONTROL_ADDRESS=${adminControl.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
