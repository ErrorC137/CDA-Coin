"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, Package, Truck, CheckCircle, Clock } from "lucide-react"

interface RecentRedemptionsProps {
  address: string
}

interface Redemption {
  id: string
  itemName: string
  cdaCost: number
  timestamp: Date
  status: "pending" | "processing" | "shipped" | "delivered"
  trackingNumber?: string
}

export function RecentRedemptions({ address }: RecentRedemptionsProps) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading redemptions
    const mockRedemptions: Redemption[] = [
      {
        id: "1",
        itemName: "CDA T-Shirt",
        cdaCost: 500,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "shipped",
        trackingNumber: "CDA123456789",
      },
      {
        id: "2",
        itemName: "CDA Notebook",
        cdaCost: 200,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "delivered",
      },
      {
        id: "3",
        itemName: "CDA Sticker Pack",
        cdaCost: 50,
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        status: "delivered",
      },
    ]

    setTimeout(() => {
      setRedemptions(mockRedemptions)
      setLoading(false)
    }, 1000)
  }, [address])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "processing":
        return Package
      case "shipped":
        return Truck
      case "delivered":
        return CheckCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "processing":
        return "text-blue-600 bg-blue-100"
      case "shipped":
        return "text-purple-600 bg-purple-100"
      case "delivered":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-600" />
            Recent Redemptions
          </CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : redemptions.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No redemptions yet</h3>
            <p className="text-sm text-gray-600">Start earning CDA tokens to redeem exclusive merchandise!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {redemptions.map((redemption) => {
              const StatusIcon = getStatusIcon(redemption.status)
              const statusColor = getStatusColor(redemption.status)

              return (
                <div
                  key={redemption.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${statusColor}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{redemption.itemName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {redemption.cdaCost} CDA
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-600">Redeemed on {formatDate(redemption.timestamp)}</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs capitalize ${statusColor.split(" ")[0]} ${statusColor.split(" ")[1]}`}
                      >
                        {redemption.status}
                      </Badge>
                    </div>

                    {redemption.trackingNumber && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Tracking: <span className="font-mono">{redemption.trackingNumber}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
