"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Zap, CheckCircle, Clock, Gift } from "lucide-react"

interface Quest {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "special"
  progress: number
  maxProgress: number
  reward: number
  completed: boolean
  icon: string
  difficulty: "easy" | "medium" | "hard"
}

export function DailyQuests() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading quests
    const mockQuests: Quest[] = [
      {
        id: "daily_1",
        title: "Early Bird",
        description: "Log in before 10 AM",
        type: "daily",
        progress: 1,
        maxProgress: 1,
        reward: 25,
        completed: true,
        icon: "🌅",
        difficulty: "easy",
      },
      {
        id: "daily_2",
        title: "Social Butterfly",
        description: "Interact with 3 community members",
        type: "daily",
        progress: 1,
        maxProgress: 3,
        reward: 50,
        completed: false,
        icon: "🦋",
        difficulty: "medium",
      },
      {
        id: "daily_3",
        title: "Knowledge Seeker",
        description: "Read 2 educational articles",
        type: "daily",
        progress: 0,
        maxProgress: 2,
        reward: 30,
        completed: false,
        icon: "📚",
        difficulty: "easy",
      },
      {
        id: "weekly_1",
        title: "Event Enthusiast",
        description: "Attend 2 events this week",
        type: "weekly",
        progress: 1,
        maxProgress: 2,
        reward: 200,
        completed: false,
        icon: "🎪",
        difficulty: "medium",
      },
      {
        id: "special_1",
        title: "Badge Hunter",
        description: "Unlock your next badge level",
        type: "special",
        progress: 0,
        maxProgress: 1,
        reward: 500,
        completed: false,
        icon: "🏆",
        difficulty: "hard",
      },
    ]

    setTimeout(() => {
      setQuests(mockQuests)
      setLoading(false)
    }, 1000)
  }, [])

  const claimReward = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId)
    if (!quest || !quest.completed) return

    try {
      // Simulate claiming reward
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, completed: false, progress: 0 } : q)))

      toast({
        title: "Quest Reward Claimed! 🎉",
        description: `You earned ${quest.reward} CDA tokens!`,
      })

      // Trigger achievement notification
      const event = new CustomEvent("achievement", {
        detail: {
          type: "quest",
          title: `${quest.title} Completed!`,
          description: quest.description,
          amount: quest.reward,
        },
      })
      window.dispatchEvent(event)
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "There was an error claiming your reward. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/20"
      case "hard":
        return "text-red-400 bg-red-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "text-blue-400 bg-blue-400/20"
      case "weekly":
        return "text-purple-400 bg-purple-400/20"
      case "special":
        return "text-pink-400 bg-pink-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  const getProgressPercentage = (quest: Quest) => {
    return (quest.progress / quest.maxProgress) * 100
  }

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Daily Quests & Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-white/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-4 rounded-lg border transition-all hover:bg-white/5 ${
                  quest.completed ? "bg-green-500/10 border-green-400/30" : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{quest.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{quest.title}</h4>
                      <Badge className={getDifficultyColor(quest.difficulty)}>{quest.difficulty}</Badge>
                      <Badge className={getTypeColor(quest.type)}>{quest.type}</Badge>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">{quest.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          Progress: {quest.progress}/{quest.maxProgress}
                        </span>
                        <Badge className="bg-yellow-600">+{quest.reward} CDA</Badge>
                      </div>

                      <Progress value={getProgressPercentage(quest)} className="h-2" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {quest.completed ? (
                      <Button
                        onClick={() => claimReward(quest.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        Claim
                      </Button>
                    ) : quest.progress === quest.maxProgress ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Complete!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">In Progress</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Quest Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Today's Progress</h4>
                  <p className="text-sm text-gray-300">
                    {quests.filter((q) => q.completed).length} of {quests.filter((q) => q.type === "daily").length}{" "}
                    daily quests completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">
                    {quests.filter((q) => q.completed).reduce((sum, q) => sum + q.reward, 0)}
                  </p>
                  <p className="text-sm text-gray-300">CDA Earned</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
