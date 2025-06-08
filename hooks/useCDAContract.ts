"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, CDA_TOKEN_ABI, BADGE_NFT_ABI } from "@/lib/contracts"

export function useCDAContract(address: string) {
  const [balance, setBalance] = useState<string>("0")
  const [userBadgeInfo, setUserBadgeInfo] = useState<any>(null)
  const [cycleInfo, setCycleInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchContractData()
    }
  }, [address])

  const fetchContractData = async () => {
    if (!address || typeof window === "undefined" || !window.ethereum) {
      setLoading(false)
      return
    }

    try {
      // Using ethers v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum)

      // Create contract instances using centralized addresses
      const cdaToken = new ethers.Contract(CONTRACT_ADDRESSES.CDA_TOKEN, CDA_TOKEN_ABI, provider)
      const badgeNFT = new ethers.Contract(CONTRACT_ADDRESSES.BADGE_NFT, BADGE_NFT_ABI, provider)

      // Fetch data in parallel
      const [tokenBalance, badgeInfo, cycle] = await Promise.all([
        cdaToken.balanceOf(address),
        badgeNFT.getUserBadgeInfo(address),
        cdaToken.getCycleInfo(),
      ])

      // Format balance - ethers v6 uses formatUnits instead of utils.formatEther
      setBalance(ethers.formatUnits(tokenBalance, 18))

      // Format badge info
      setUserBadgeInfo({
        currentLevel: Number(badgeInfo.currentLevel),
        badgeTokenIds: badgeInfo.badgeTokenIds.map((id: any) => Number(id)),
        eventsAttended: Number(badgeInfo.eventsAttended),
        volunteeredTimes: Number(badgeInfo.volunteeredTimes),
        presentationsMade: Number(badgeInfo.presentationsMade),
        projectsCompleted: Number(badgeInfo.projectsCompleted),
      })

      // Format cycle info
      setCycleInfo({
        cycle: Number(cycle.cycle),
        resetTimestamp: Number(cycle.resetTimestamp),
        totalSupply: ethers.formatUnits(cycle.totalSupply, 18),
        daysUntilReset: Number(cycle.daysUntilReset),
      })
    } catch (error) {
      console.error("Error fetching contract data:", error)

      // Set mock data for development
      setBalance("1250")
      setUserBadgeInfo({
        currentLevel: 2,
        badgeTokenIds: [1, 2],
        eventsAttended: 12,
        volunteeredTimes: 4,
        presentationsMade: 1,
        projectsCompleted: 0,
      })
      setCycleInfo({
        cycle: 1,
        resetTimestamp: Math.floor(Date.now() / 1000),
        totalSupply: "100000",
        daysUntilReset: 245,
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    setLoading(true)
    fetchContractData()
  }

  return {
    balance,
    userBadgeInfo,
    cycleInfo,
    loading,
    refreshData,
  }
}
