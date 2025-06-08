"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Gift, Zap, X } from "lucide-react"

interface Achievement {
  id: string
  type: "badge" | "milestone" | "quest" | "claim"
  title: string
  description: string
  reward?: number
  icon: string
}

interface AchievementNotificationsProps {
  onAchievement: () => void
}

export function AchievementNotifications({ onAchievement }: AchievementNotificationsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const handleAchievement = (event: CustomEvent) => {
      const { type, amount, title, description } = event.detail

      const achievement: Achievement = {
        id: Date.now().toString(),
        type: type,
        title: title || getDefaultTitle(type),
        description: description || getDefaultDescription(type, amount),
        reward: amount,
        icon: getIcon(type),
      }

      setAchievements((prev) => [...prev, achievement])
      onAchievement()

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setAchievements((prev) => prev.filter((a) => a.id !== achievement.id))
      }, 5000)
    }

    window.addEventListener("achievement", handleAchievement as EventListener)
    return () => window.removeEventListener("achievement", handleAchievement as EventListener)
  }, [onAchievement])

  const getDefaultTitle = (type: string) => {
    switch (type) {
      case "badge":
        return "New Badge Unlocked!"
      case "milestone":
        return "Milestone Achieved!"
      case "quest":
        return "Quest Completed!"
      case "claim":
        return "Tokens Claimed!"
      default:
        return "Achievement Unlocked!"
    }
  }

  const getDefaultDescription = (type: string, amount?: number) => {
    switch (type) {
      case "badge":
        return "You've earned a new achievement badge!"
      case "milestone":
        return "You've reached an important milestone!"
      case "quest":
        return "Daily quest completed successfully!"
      case "claim":
        return `You received ${amount} CDA tokens!`
      default:
        return "Great job!"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "badge":
        return "🏆"
      case "milestone":
        return "⭐"
      case "quest":
        return "⚡"
      case "claim":
        return "🎁"
      default:
        return "🎉"
    }
  }

  const getIconComponent = (type: string) => {
    switch (type) {
      case "badge":
        return Trophy
      case "milestone":
        return Star
      case "quest":
        return Zap
      case "claim":
        return Gift
      default:
        return Star
    }
  }

  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {achievements.map((achievement) => {
        const IconComponent = getIconComponent(achievement.type)

        return (
          <Card
            key={achievement.id}
            className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-lg border-white/20 text-white animate-slide-in-right"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <button
                      onClick={() => removeAchievement(achievement.id)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-white/80 mt-1">{achievement.description}</p>

                  {achievement.reward && (
                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                      +{achievement.reward} CDA
                    </Badge>
                  )}
                </div>

                <div className="text-2xl animate-bounce">{achievement.icon}</div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
