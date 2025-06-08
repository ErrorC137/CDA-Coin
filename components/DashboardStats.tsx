"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Coins, Trophy, Calendar, Users } from "lucide-react"

interface DashboardStatsProps {
  balance: string
  userBadgeInfo: any
  cycleInfo: any
}

export function DashboardStats({ balance, userBadgeInfo, cycleInfo }: DashboardStatsProps) {
  const formatBalance = (bal: string) => {
    const num = Number.parseFloat(bal)
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toFixed(0)
  }

  const getBadgeLevelName = (level: number) => {
    const levels = ["None", "Newcomer", "Helper", "Contributor", "Leader", "Champion"]
    return levels[level] || "Unknown"
  }

  const getBadgeColor = (level: number) => {
    const colors = ["gray", "green", "blue", "purple", "orange", "red"]
    return colors[level] || "gray"
  }

  const calculateProgress = () => {
    if (!userBadgeInfo) return 0
    const currentLevel = userBadgeInfo.currentLevel || 0
    if (currentLevel >= 5) return 100

    // Simple progress calculation based on events attended
    const eventsAttended = userBadgeInfo.eventsAttended || 0
    const nextLevelRequirement = [0, 5, 10, 15, 25, 40][currentLevel + 1] || 40
    return Math.min((eventsAttended / nextLevelRequirement) * 100, 100)
  }

  const stats = [
    {
      title: "CDA Balance",
      value: formatBalance(balance || "0"),
      subtitle: "Available tokens",
      icon: Coins,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Badge Level",
      value: getBadgeLevelName(userBadgeInfo?.currentLevel || 0),
      subtitle: `Level ${userBadgeInfo?.currentLevel || 0}`,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Events Attended",
      value: userBadgeInfo?.eventsAttended || 0,
      subtitle: "Total participation",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Presentations",
      value: userBadgeInfo?.presentationsMade || 0,
      subtitle: "Knowledge shared",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>

            {stat.title === "Badge Level" && userBadgeInfo?.currentLevel < 5 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress to next level</span>
                  <span>{calculateProgress().toFixed(0)}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
            )}
          </CardContent>

          {stat.title === "Badge Level" && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className={`text-xs bg-${getBadgeColor(userBadgeInfo?.currentLevel || 0)}-100 text-${getBadgeColor(userBadgeInfo?.currentLevel || 0)}-800`}
              >
                {userBadgeInfo?.currentLevel || 0}/5
              </Badge>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
