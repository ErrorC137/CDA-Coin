import { NextResponse } from "next/server"

// Server-side API route to provide contract addresses
export async function GET() {
  const contractAddresses = {
    CDA_TOKEN: process.env.CDA_TOKEN_ADDRESS || "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
    BADGE_NFT: process.env.BADGE_NFT_ADDRESS || "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    SWAG_REDEMPTION: process.env.SWAG_REDEMPTION_ADDRESS || "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    RESET_MANAGER: process.env.RESET_MANAGER_ADDRESS || "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    ADMIN_CONTROL: process.env.ADMIN_CONTROL_ADDRESS || "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  }

  return NextResponse.json(contractAddresses)
}
