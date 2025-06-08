"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Flame } from "lucide-react"

export function StreakCounter() {
  const [streak, setStreak] = useState(7) // Mock streak data
  const [lastActivity, setLastActivity] = useState<Date>(new Date())

  useEffect(() => {
    // In production, this would fetch real streak data
    const mockStreak = Math.floor(Math.random() * 30) + 1
    setStreak(mockStreak)
  }, [])

  const getStreakColor = () => {
    if (streak >= 30) return "text-red-400 bg-red-400/20 border-red-400/30"
    if (streak >= 14) return "text-orange-400 bg-orange-400/20 border-orange-400/30"
    if (streak >= 7) return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30"
    return "text-blue-400 bg-blue-400/20 border-blue-400/30"
  }

  const getStreakEmoji = () => {
    if (streak >= 30) return "🔥"
    if (streak >= 14) return "⚡"
    if (streak >= 7) return "🌟"
    return "💫"
  }

  return (
    <Badge className={`${getStreakColor()} animate-pulse`}>
      <span className="mr-1">{getStreakEmoji()}</span>
      <Flame className="w-3 h-3 mr-1" />
      {streak} day streak
    </Badge>
  )
}
