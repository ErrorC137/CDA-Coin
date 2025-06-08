"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from "lucide-react"

interface LeaderboardEntry {
  address: string
  balance: number
  level: number
  eventsAttended: number
  rank: number
  change: number
}

interface LeaderboardPageProps {
  currentUser?: string
}

export function LeaderboardPage({ currentUser }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading leaderboard data
    const mockData: LeaderboardEntry[] = [
      {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        balance: 2500,
        level: 5,
        eventsAttended: 15,
        rank: 1,
        change: 0,
      },
      {
        address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        balance: 2100,
        level: 4,
        eventsAttended: 12,
        rank: 2,
        change: 1,
      },
      {
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        balance: 1800,
        level: 4,
        eventsAttended: 10,
        rank: 3,
        change: -1,
      },
      {
        address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        balance: 1500,
        level: 3,
        eventsAttended: 8,
        rank: 4,
        change: 2,
      },
      {
        address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        balance: 1200,
        level: 3,
        eventsAttended: 7,
        rank: 5,
        change: 0,
      },
    ]

    setTimeout(() => {
      setLeaderboard(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <Award className="w-6 h-6 text-blue-400" />
    }
  }

  const getLevelEmoji = (level: number) => {
    if (level >= 5) return "👑"
    if (level >= 4) return "🏆"
    if (level >= 3) return "⭐"
    if (level >= 2) return "🎯"
    if (level >= 1) return "🌟"
    return "🚀"
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Community Leaderboard
          </CardTitle>
          <CardDescription className="text-gray-300">Loading community rankings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Players</p>
                <p className="text-2xl font-bold text-blue-400">{leaderboard.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Your Rank</p>
                <p className="text-2xl font-bold text-yellow-400">
                  #{leaderboard.find((entry) => entry.address === currentUser)?.rank || "N/A"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Top Score</p>
                <p className="text-2xl font-bold text-green-400">{leaderboard[0]?.balance || 0} CDA</p>
              </div>
              <Crown className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Top Community Members
          </CardTitle>
          <CardDescription className="text-gray-300">
            Rankings based on CDA tokens earned and community participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.address}
                className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-white/5 ${
                  entry.address === currentUser ? "bg-blue-500/20 border border-blue-400/30" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="text-lg font-bold">#{entry.rank}</span>
                  </div>

                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${entry.address}`} />
                    <AvatarFallback>{entry.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatAddress(entry.address)}</p>
                      {entry.address === currentUser && <Badge className="bg-blue-600 text-white text-xs">You</Badge>}
                    </div>
                    <p className="text-sm text-gray-400">
                      Level {entry.level} • {entry.eventsAttended} events
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getLevelEmoji(entry.level)}</span>
                    <div>
                      <p className="text-lg font-bold text-yellow-400">{entry.balance} CDA</p>
                      <div className="flex items-center gap-1">
                        {entry.change > 0 && <Badge className="bg-green-600 text-white text-xs">↑{entry.change}</Badge>}
                        {entry.change < 0 && (
                          <Badge className="bg-red-600 text-white text-xs">↓{Math.abs(entry.change)}</Badge>
                        )}
                        {entry.change === 0 && <Badge className="bg-gray-600 text-white text-xs">-</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Showcase */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-medium">Community Champion</p>
                  <p className="text-sm text-gray-400">Earned by {formatAddress(leaderboard[0]?.address || "")}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-medium">Rising Star</p>
                  <p className="text-sm text-gray-400">Earned by {formatAddress(leaderboard[3]?.address || "")}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
