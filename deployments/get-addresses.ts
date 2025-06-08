import fs from "fs"

async function getDeployedAddresses() {
  console.log("📋 Getting deployed contract addresses...")

  // Updated deployed contract addresses from latest deployment
  const addresses = {
    TOKEN_ADDRESS: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
    BADGE_NFT_ADDRESS: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    SWAG_REDEMPTION_ADDRESS: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    RESET_MANAGER_ADDRESS: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    ADMIN_CONTROL_ADDRESS: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  }

  // Generate .env.local content
  const envContent = `# CDA Coin Contract Addresses - Latest Deployment
NEXT_PUBLIC_CDA_TOKEN_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
NEXT_PUBLIC_BADGE_NFT_ADDRESS=0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e
NEXT_PUBLIC_SWAG_REDEMPTION_ADDRESS=0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
NEXT_PUBLIC_RESET_MANAGER_ADDRESS=0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
NEXT_PUBLIC_ADMIN_CONTROL_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318

# Server-side contract addresses
CDA_TOKEN_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
BADGE_NFT_ADDRESS=0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e
SWAG_REDEMPTION_ADDRESS=0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
RESET_MANAGER_ADDRESS=0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82
ADMIN_CONTROL_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Private keys and API keys (keep these secure)
PRIVATE_KEY=your_polygon_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
`

  fs.writeFileSync(".env.local", envContent)
  console.log("✅ .env.local file created with deployed contract addresses!")

  return addresses
}

getDeployedAddresses().catch(console.error)
