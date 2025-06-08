"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

export function useWallet() {
  const [address, setAddress] = useState<string>("")
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  // Check if MetaMask is installed
  const isMetaMaskInstalled = isBrowser && typeof window.ethereum !== "undefined"

  // Initialize wallet connection
  useEffect(() => {
    if (!isMetaMaskInstalled) return

    const checkConnection = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          setAddress(accounts[0].address)
          const network = await provider.getNetwork()
          setChainId(Number(network.chainId))
        }
      } catch (err) {
        console.error("Failed to check wallet connection:", err)
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
        } else {
          setAddress("")
        }
      })

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [isMetaMaskInstalled])

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask is not installed")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])

        // Get chain ID
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }, [isMetaMaskInstalled])

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    setAddress("")
  }, [])

  return {
    address,
    chainId,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
  }
}
