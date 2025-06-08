"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Calendar, Target, Gift, Clock, CheckCircle, Star, Flame } from "lucide-react"

interface Quest {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  maxProgress: number
  completed: boolean
  type: "daily" | "weekly" | "special"
  difficulty: "easy" | "medium" | "hard"
  icon: string
  timeLeft?: string
}

export function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("daily")

  useEffect(() => {
    // Simulate loading quest data
    const mockQuests: Quest[] = [
      // Daily Quests
      {
        id: "daily-1",
        title: "Daily Check-in",
        description: "Visit the CDA Coin dashboard",
        reward: 10,
        progress: 1,
        maxProgress: 1,
        completed: true,
        type: "daily",
        difficulty: "easy",
        icon: "📅",
        timeLeft: "18h 32m",
      },
      {
        id: "daily-2",
        title: "Community Engagement",
        description: "Interact with 3 community posts",
        reward: 25,
        progress: 1,
        maxProgress: 3,
        completed: false,
        type: "daily",
        difficulty: "easy",
        icon: "💬",
        timeLeft: "18h 32m",
      },
      {
        id: "daily-3",
        title: "Share Achievement",
        description: "Share your latest badge on social media",
        reward: 15,
        progress: 0,
        maxProgress: 1,
        completed: false,
        type: "daily",
        difficulty: "medium",
        icon: "📱",
        timeLeft: "18h 32m",
      },
      // Weekly Quests
      {
        id: "weekly-1",
        title: "Event Attendance",
        description: "Attend 2 community events this week",
        reward: 100,
        progress: 1,
        maxProgress: 2,
        completed: false,
        type: "weekly",
        difficulty: "medium",
        icon: "🎪",
        timeLeft: "4d 12h",
      },
      {
        id: "weekly-2",
        title: "Volunteer Hours",
        description: "Complete 5 hours of volunteer work",
        reward: 150,
        progress: 2,
        maxProgress: 5,
        completed: false,
        type: "weekly",
        difficulty: "hard",
        icon: "🤝",
        timeLeft: "4d 12h",
      },
      // Special Quests
      {
        id: "special-1",
        title: "Community Builder",
        description: "Invite 5 new members to join CDA Coin",
        reward: 500,
        progress: 2,
        maxProgress: 5,
        completed: false,
        type: "special",
        difficulty: "hard",
        icon: "👥",
      },
      {
        id: "special-2",
        title: "Badge Collector",
        description: "Earn your first 3 achievement badges",
        reward: 200,
        progress: 1,
        maxProgress: 3,
        completed: false,
        type: "special",
        difficulty: "medium",
        icon: "🏆",
      },
    ]

    setTimeout(() => {
      setQuests(mockQuests)
      setLoading(false)
    }, 1000)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-600"
      case "medium":
        return "bg-yellow-600"
      case "hard":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Calendar className="w-4 h-4" />
      case "weekly":
        return <Target className="w-4 h-4" />
      case "special":
        return <Star className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const handleClaimReward = (questId: string) => {
    setQuests((prev) =>
      prev.map((quest) => (quest.id === questId ? { ...quest, completed: true, progress: quest.maxProgress } : quest)),
    )
  }

  const filterQuests = (type: string) => {
    return quests.filter((quest) => quest.type === type)
  }

  const completedQuests = quests.filter((q) => q.completed).length
  const totalRewards = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.reward, 0)

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Daily Quests & Challenges
          </CardTitle>
          <CardDescription className="text-gray-300">Loading your quests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading quests...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-green-400">{completedQuests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Quests</p>
                <p className="text-2xl font-bold text-blue-400">{quests.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Rewards Earned</p>
                <p className="text-2xl font-bold text-yellow-400">{totalRewards}</p>
              </div>
              <Gift className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Streak</p>
                <p className="text-2xl font-bold text-orange-400">7</p>
              </div>
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quest Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-lg">
          <TabsTrigger value="daily" className="flex items-center gap-2 data-[state=active]:bg-white/20">
            <Calendar className="w-4 h-4" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-white/20">
            <Target className="w-4 h-4" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2 data-[state=active]:bg-white/20">
            <Star className="w-4 h-4" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <div className="grid gap-4">
            {filterQuests("daily").map((quest) => (
              <Card key={quest.id} className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{quest.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{quest.title}</h3>
                          <Badge className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </Badge>
                          {quest.completed && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{quest.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              Progress: {quest.progress}/{quest.maxProgress}
                            </span>
                            <span className="text-yellow-400">+{quest.reward} CDA</span>
                          </div>
                          <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                        </div>

                        {quest.timeLeft && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {quest.timeLeft} remaining
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {quest.completed ? (
                        <Button disabled className="bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Claimed
                        </Button>
                      ) : quest.progress >= quest.maxProgress ? (
                        <Button
                          onClick={() => handleClaimReward(quest.id)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Claim
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          In Progress
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="grid gap-4">
            {filterQuests("weekly").map((quest) => (
              <Card key={quest.id} className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{quest.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{quest.title}</h3>
                          <Badge className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </Badge>
                          {quest.completed && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{quest.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              Progress: {quest.progress}/{quest.maxProgress}
                            </span>
                            <span className="text-yellow-400">+{quest.reward} CDA</span>
                          </div>
                          <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                        </div>

                        {quest.timeLeft && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {quest.timeLeft} remaining
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {quest.completed ? (
                        <Button disabled className="bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Claimed
                        </Button>
                      ) : quest.progress >= quest.maxProgress ? (
                        <Button
                          onClick={() => handleClaimReward(quest.id)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Claim
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          In Progress
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <div className="grid gap-4">
            {filterQuests("special").map((quest) => (
              <Card key={quest.id} className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{quest.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{quest.title}</h3>
                          <Badge className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </Badge>
                          <Badge className="bg-purple-600 text-white text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Special
                          </Badge>
                          {quest.completed && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{quest.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              Progress: {quest.progress}/{quest.maxProgress}
                            </span>
                            <span className="text-yellow-400">+{quest.reward} CDA</span>
                          </div>
                          <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {quest.completed ? (
                        <Button disabled className="bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Claimed
                        </Button>
                      ) : quest.progress >= quest.maxProgress ? (
                        <Button
                          onClick={() => handleClaimReward(quest.id)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Claim
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          In Progress
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
