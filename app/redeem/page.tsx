"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/hooks/useWallet"
import { useCDAContract } from "@/hooks/useCDAContract"
import { useToast } from "@/hooks/use-toast"
import { Gift, ShoppingCart, Lock, Package } from "lucide-react"

interface SwagItem {
  id: number
  name: string
  description: string
  cdaCost: number
  minBadgeLevel: number
  remainingSupply: number
  totalSupply: number
  imageUrl: string
  category: string
}

export default function RedeemPage() {
  const { isConnected, address } = useWallet()
  const { balance, userBadgeInfo } = useCDAContract(address)
  const { toast } = useToast()

  const [swagItems, setSwagItems] = useState<SwagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<SwagItem | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [shippingInfo, setShippingInfo] = useState("")
  const [filter, setFilter] = useState<"all" | "available" | "affordable">("all")

  useEffect(() => {
    fetchSwagItems()
  }, [])

  const fetchSwagItems = async () => {
    // Mock data - in production this would fetch from the smart contract
    const mockItems: SwagItem[] = [
      {
        id: 1,
        name: "CDA T-Shirt",
        description: "Official CDA branded t-shirt made from premium cotton",
        cdaCost: 500,
        minBadgeLevel: 1,
        remainingSupply: 85,
        totalSupply: 100,
        imageUrl: "/placeholder.svg?height=200&width=200",
        category: "Apparel",
      },
      {
        id: 2,
        name: "CDA Hoodie",
        description: "Premium CDA hoodie perfect for cool weather",
        cdaCost: 1200,
        minBadgeLevel: 2,
        remainingSupply: 42,
        totalSupply: 50,
        imageUrl: "/placeholder.svg?height=200&width=200",
        category: "Apparel",
      },
      {
        id: 3,
        name: "CDA Notebook",
        description: "High-quality notebook with CDA branding for taking notes",
        cdaCost: 200,
        minBadgeLevel: 1,
        remainingSupply: 156,
        totalSupply: 200,
        imageUrl: "/placeholder.svg?height=200&width=200",
        category: "Stationery",
      },
      {
        id: 4,
        name: "CDA Sticker Pack",
        description: "Collection of awesome CDA stickers",
        cdaCost: 50,
        minBadgeLevel: 0,
        remainingSupply: 423,
        totalSupply: 500,
        imageUrl: "/placeholder.svg?height=200&width=200",
        category: "Accessories",
      },
      {
        id: 5,
        name: "CDA Leader Jacket",
        description: "Exclusive jacket for CDA community leaders",
        cdaCost: 2500,
        minBadgeLevel: 4,
        remainingSupply: 18,
        totalSupply: 20,
        imageUrl: "/placeholder.svg?height=200&width=200",
        category: "Apparel",
      },
      {
        id: 6,
        name: "CDA Water Bottle",
        description: "Insulated water bottle with CDA logo",
        cdaCost: 300,
        minBadgeLevel: 1,
        remainingSupply: 67,
        totalSupply: 100,
        imageUrl: "/placeholder.svg?height=200&width=200",
        category: "Accessories",
      },
    ]

    setTimeout(() => {
      setSwagItems(mockItems)
      setLoading(false)
    }, 1000)
  }

  const canRedeem = (item: SwagItem) => {
    const hasEnoughTokens = Number.parseFloat(balance) >= item.cdaCost
    const hasRequiredLevel = (userBadgeInfo?.currentLevel || 0) >= item.minBadgeLevel
    const inStock = item.remainingSupply > 0

    return hasEnoughTokens && hasRequiredLevel && inStock
  }

  const getRedeemButtonText = (item: SwagItem) => {
    if (item.remainingSupply === 0) return "Out of Stock"
    if ((userBadgeInfo?.currentLevel || 0) < item.minBadgeLevel) return "Badge Level Required"
    if (Number.parseFloat(balance) < item.cdaCost) return "Insufficient CDA"
    return "Redeem Now"
  }

  const handleRedeem = async () => {
    if (!selectedItem || !canRedeem(selectedItem)) return

    setIsRedeeming(true)
    try {
      // In production, this would call the smart contract
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Redemption Successful!",
        description: `Your ${selectedItem.name} has been redeemed. You'll receive tracking information soon.`,
      })

      // Update local state
      setSwagItems((items) =>
        items.map((item) =>
          item.id === selectedItem.id ? { ...item, remainingSupply: item.remainingSupply - 1 } : item,
        ),
      )

      setSelectedItem(null)
      setShippingInfo("")
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "There was an error processing your redemption. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  const filteredItems = swagItems.filter((item) => {
    switch (filter) {
      case "available":
        return item.remainingSupply > 0
      case "affordable":
        return Number.parseFloat(balance) >= item.cdaCost
      default:
        return true
    }
  })

  const getBadgeLevelName = (level: number) => {
    const levels = ["None", "Newcomer", "Helper", "Contributor", "Leader", "Champion"]
    return levels[level] || "Unknown"
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Gift className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <CardTitle>Connect Wallet to Redeem</CardTitle>
            <CardDescription>Connect your wallet to access the merchandise store</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchandise Store 🛍️</h1>
          <p className="text-gray-600">Redeem your CDA tokens for exclusive merchandise</p>
        </div>

        {/* Balance and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {balance} CDA Available
            </Badge>
            <Badge variant="secondary">Badge Level: {getBadgeLevelName(userBadgeInfo?.currentLevel || 0)}</Badge>
          </div>

          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All Items
            </Button>
            <Button
              variant={filter === "available" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("available")}
            >
              In Stock
            </Button>
            <Button
              variant={filter === "affordable" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("affordable")}
            >
              Affordable
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                  {item.remainingSupply === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                  {item.minBadgeLevel > (userBadgeInfo?.currentLevel || 0) && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Level {item.minBadgeLevel}+
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{item.cdaCost} CDA</span>
                      {item.minBadgeLevel > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Level {item.minBadgeLevel}+
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {item.remainingSupply} / {item.totalSupply} left
                      </p>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={!canRedeem(item)}
                        variant={canRedeem(item) ? "default" : "secondary"}
                        onClick={() => setSelectedItem(item)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {getRedeemButtonText(item)}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Redeem {selectedItem?.name}</DialogTitle>
                        <DialogDescription>
                          Please provide your shipping information to complete the redemption.
                        </DialogDescription>
                      </DialogHeader>

                      {selectedItem && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={selectedItem.imageUrl || "/placeholder.svg"}
                              alt={selectedItem.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{selectedItem.name}</h4>
                              <p className="text-sm text-gray-600">{selectedItem.description}</p>
                              <Badge className="mt-1">{selectedItem.cdaCost} CDA</Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shipping">Shipping Information</Label>
                            <Textarea
                              id="shipping"
                              placeholder="Please provide your full name, address, and any special delivery instructions..."
                              value={shippingInfo}
                              onChange={(e) => setShippingInfo(e.target.value)}
                              rows={4}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedItem(null)
                                setShippingInfo("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={handleRedeem}
                              disabled={isRedeeming || !shippingInfo.trim()}
                            >
                              {isRedeeming ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Package className="w-4 h-4 mr-2" />
                                  Confirm Redemption
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {filter === "affordable"
                ? "You need more CDA tokens to afford these items"
                : filter === "available"
                  ? "All items are currently out of stock"
                  : "No merchandise available at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
