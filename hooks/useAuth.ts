"use client"

import { useState, useEffect } from "react"

interface User {
  address: string
  isAdmin: boolean
  name?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin based on wallet address
    // In production, this would check against a smart contract or database
    const checkAdminStatus = (address: string) => {
      const adminAddresses = [
        "0x1234567890123456789012345678901234567890", // Replace with actual admin addresses
        "0x2345678901234567890123456789012345678901",
      ]
      return adminAddresses.includes(address.toLowerCase())
    }

    // Listen for wallet connection changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        const address = accounts[0]
        const adminStatus = checkAdminStatus(address)
        setUser({ address, isAdmin: adminStatus })
        setIsAdmin(adminStatus)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    }

    // Check initial connection
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.request({ method: "eth_accounts" }).then(handleAccountsChanged).catch(console.error)

      window.ethereum.on("accountsChanged", handleAccountsChanged)
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  return { user, isAdmin }
}
