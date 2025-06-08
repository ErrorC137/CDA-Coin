import { run } from "hardhat"

interface ContractAddresses {
  adminControl: string
  cdaToken: string
  badgeNFT: string
  swagRedemption: string
  resetManager: string
}

async function verifyContracts(addresses: ContractAddresses) {
  console.log("🔍 Starting contract verification...")

  try {
    // Verify AdminControl
    console.log("\n📋 Verifying AdminControl...")
    await run("verify:verify", {
      address: addresses.adminControl,
      constructorArguments: [],
    })
    console.log("✅ AdminControl verified")

    // Verify CDAERC20
    console.log("\n🪙 Verifying CDAERC20...")
    await run("verify:verify", {
      address: addresses.cdaToken,
      constructorArguments: [addresses.adminControl],
    })
    console.log("✅ CDAERC20 verified")

    // Verify CDABadgeNFT
    console.log("\n🏆 Verifying CDABadgeNFT...")
    await run("verify:verify", {
      address: addresses.badgeNFT,
      constructorArguments: [addresses.adminControl, addresses.cdaToken],
    })
    console.log("✅ CDABadgeNFT verified")

    // Verify SwagRedemption
    console.log("\n🛍️ Verifying SwagRedemption...")
    await run("verify:verify", {
      address: addresses.swagRedemption,
      constructorArguments: [addresses.adminControl, addresses.cdaToken, addresses.badgeNFT],
    })
    console.log("✅ SwagRedemption verified")

    // Verify CDAResetManager
    console.log("\n🔄 Verifying CDAResetManager...")
    await run("verify:verify", {
      address: addresses.resetManager,
      constructorArguments: [addresses.adminControl, addresses.cdaToken],
    })
    console.log("✅ CDAResetManager verified")

    console.log("\n🎉 All contracts verified successfully!")
  } catch (error) {
    console.error("❌ Verification failed:", error)
    throw error
  }
}

// Example usage
const DEPLOYED_ADDRESSES: ContractAddresses = {
  adminControl: "0x...", // Replace with actual addresses
  cdaToken: "0x...",
  badgeNFT: "0x...",
  swagRedemption: "0x...",
  resetManager: "0x...",
}

if (require.main === module) {
  verifyContracts(DEPLOYED_ADDRESSES)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { verifyContracts }
