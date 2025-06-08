"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Coins, Trophy, Gift, Calendar, Zap } from "lucide-react"

interface ActivityItem {
  id: string
  type: "reward" | "badge" | "redemption" | "event" | "quest"
  title: string
  description: string
  amount?: number
  timestamp: Date
  icon: string
}

interface ActivityFeedProps {
  address: string
}

export function ActivityFeed({ address }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading activities
    const mockActivities: ActivityItem[] = [
      {
        id: "1",
        type: "reward",
        title: "Daily Claim Reward",
        description: "Claimed daily CDA tokens",
        amount: 50,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        icon: "🎁",
      },
      {
        id: "2",
        type: "event",
        title: "Workshop Attendance",
        description: "Attended 'Smart Contract Security' workshop",
        amount: 100,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        icon: "📚",
      },
      {
        id: "3",
        type: "badge",
        title: "Badge Earned",
        description: "Unlocked Helper badge (Level 2)",
        amount: 250,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        icon: "🏆",
      },
      {
        id: "4",
        type: "quest",
        title: "Daily Quest Complete",
        description: "Completed 'Connect Wallet' quest",
        amount: 25,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        icon: "⚡",
      },
      {
        id: "5",
        type: "redemption",
        title: "Merchandise Redeemed",
        description: "Redeemed CDA Sticker Pack",
        amount: -50,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        icon: "🛍️",
      },
      {
        id: "6",
        type: "reward",
        title: "Presentation Bonus",
        description: "Gave presentation on 'DeFi Basics'",
        amount: 200,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        icon: "🎤",
      },
    ]

    setTimeout(() => {
      setActivities(mockActivities)
      setLoading(false)
    }, 1000)
  }, [address])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "reward":
        return Coins
      case "badge":
        return Trophy
      case "redemption":
        return Gift
      case "event":
        return Calendar
      case "quest":
        return Zap
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "reward":
        return "text-green-400 bg-green-400/20"
      case "badge":
        return "text-yellow-400 bg-yellow-400/20"
      case "redemption":
        return "text-pink-400 bg-pink-400/20"
      case "event":
        return "text-blue-400 bg-blue-400/20"
      case "quest":
        return "text-purple-400 bg-purple-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type)
                const colorClass = getActivityColor(activity.type)

                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white truncate">{activity.title}</h4>
                        {activity.amount && (
                          <Badge variant={activity.amount > 0 ? "default" : "destructive"} className="text-xs ml-2">
                            {activity.amount > 0 ? "+" : ""}
                            {activity.amount} CDA
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-300 truncate">{activity.description}</p>
                        <span className="text-xs text-gray-400 ml-2">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
