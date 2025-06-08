"use client"

import { useState, useEffect } from "react"

interface ContractAddresses {
  CDA_TOKEN: string
  BADGE_NFT: string
  SWAG_REDEMPTION: string
  RESET_MANAGER: string
  ADMIN_CONTROL: string
}

export function useContractAddresses() {
  const [addresses, setAddresses] = useState<ContractAddresses>({
    CDA_TOKEN: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
    BADGE_NFT: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    SWAG_REDEMPTION: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    RESET_MANAGER: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
    ADMIN_CONTROL: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  })

  useEffect(() => {
    // Try to fetch from API route first, fallback to hardcoded values
    fetch("/api/contracts")
      .then((res) => res.json())
      .then((data) => setAddresses(data))
      .catch(() => {
        // Use hardcoded fallback addresses if API fails
        console.log("Using fallback contract addresses")
      })
  }, [])

  return addresses
}
