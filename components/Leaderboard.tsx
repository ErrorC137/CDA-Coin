"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Crown, TrendingUp } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  address: string
  name: string
  balance: number
  badgeLevel: number
  eventsAttended: number
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  currentUser: string
}

export function Leaderboard({ currentUser }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        address: "0x1234...5678",
        name: "CryptoChampion",
        balance: 5420,
        badgeLevel: 5,
        eventsAttended: 45,
        isCurrentUser: false,
      },
      {
        rank: 2,
        address: "0x2345...6789",
        name: "BlockchainBoss",
        balance: 4890,
        badgeLevel: 4,
        eventsAttended: 38,
        isCurrentUser: false,
      },
      {
        rank: 3,
        address: "0x3456...7890",
        name: "DeFiDynamo",
        balance: 4320,
        badgeLevel: 4,
        eventsAttended: 35,
        isCurrentUser: false,
      },
      {
        rank: 4,
        address: currentUser,
        name: "You",
        balance: 3750,
        badgeLevel: 3,
        eventsAttended: 28,
        isCurrentUser: true,
      },
      {
        rank: 5,
        address: "0x5678...1234",
        name: "TokenTrader",
        balance: 3200,
        badgeLevel: 3,
        eventsAttended: 25,
        isCurrentUser: false,
      },
    ]

    setTimeout(() => {
      setLeaderboard(mockData)
      setLoading(false)
    }, 1000)
  }, [currentUser])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-300" />
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />
      default:
        return <Award className="w-4 h-4 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400 bg-yellow-400/20"
      case 2:
        return "text-gray-300 bg-gray-300/20"
      case 3:
        return "text-orange-400 bg-orange-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  const getBadgeLevelEmoji = (level: number) => {
    switch (level) {
      case 5:
        return "👑"
      case 4:
        return "🏆"
      case 3:
        return "⭐"
      case 2:
        return "🎯"
      case 1:
        return "🌟"
      default:
        return "🚀"
    }
  }

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.address}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-white/5 ${
                  entry.isCurrentUser ? "bg-blue-500/20 border border-blue-400/30" : "bg-white/5"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {entry.rank <= 3 ? (
                    getRankIcon(entry.rank)
                  ) : (
                    <Badge className={getRankColor(entry.rank)}>#{entry.rank}</Badge>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {entry.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white truncate">{entry.isCurrentUser ? "You" : entry.name}</h4>
                    <span className="text-lg">{getBadgeLevelEmoji(entry.badgeLevel)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-300">
                    <span>{entry.balance.toLocaleString()} CDA</span>
                    <span>{entry.eventsAttended} events</span>
                    <span>Level {entry.badgeLevel}</span>
                  </div>
                </div>

                {/* Special Badges */}
                {entry.rank === 1 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Champion</Badge>
                )}
                {entry.isCurrentUser && <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">You</Badge>}
              </div>
            ))}
          </div>
        )}

        {/* View Full Leaderboard */}
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View Full Leaderboard →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
