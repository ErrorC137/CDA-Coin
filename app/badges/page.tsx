"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/useWallet"
import { useCDAContract } from "@/hooks/useCDAContract"
import { Trophy, Star, Target, Calendar, Users, Presentation, Briefcase, CheckCircle, Lock } from "lucide-react"

interface BadgeLevel {
  level: number
  name: string
  description: string
  requirements: {
    events: number
    volunteers: number
    presentations: number
    projects: number
  }
  reward: number
  color: string
  icon: string
}

export default function BadgesPage() {
  const { isConnected, address } = useWallet()
  const { userBadgeInfo, loading } = useCDAContract(address)

  const badgeLevels: BadgeLevel[] = [
    {
      level: 1,
      name: "Newcomer",
      description: "Welcome to the CDA community! You've taken your first steps.",
      requirements: { events: 5, volunteers: 0, presentations: 0, projects: 0 },
      reward: 100,
      color: "green",
      icon: "🌱",
    },
    {
      level: 2,
      name: "Helper",
      description: "You're actively participating and helping others in the community.",
      requirements: { events: 10, volunteers: 3, presentations: 0, projects: 0 },
      reward: 250,
      color: "blue",
      icon: "🤝",
    },
    {
      level: 3,
      name: "Contributor",
      description: "You're sharing knowledge and contributing to community growth.",
      requirements: { events: 15, volunteers: 5, presentations: 2, projects: 1 },
      reward: 500,
      color: "purple",
      icon: "💡",
    },
    {
      level: 4,
      name: "Leader",
      description: "You're a community leader, mentoring others and driving initiatives.",
      requirements: { events: 25, volunteers: 10, presentations: 5, projects: 3 },
      reward: 1000,
      color: "orange",
      icon: "👑",
    },
    {
      level: 5,
      name: "Champion",
      description: "The highest honor - you're a true CDA champion and role model.",
      requirements: { events: 40, volunteers: 20, presentations: 10, projects: 5 },
      reward: 2000,
      color: "red",
      icon: "🏆",
    },
  ]

  const getProgress = (requirement: number, current: number) => {
    return Math.min((current / requirement) * 100, 100)
  }

  const isRequirementMet = (requirement: number, current: number) => {
    return current >= requirement
  }

  const hasEarnedBadge = (level: number) => {
    return (userBadgeInfo?.currentLevel || 0) >= level
  }

  const canEarnBadge = (badge: BadgeLevel) => {
    if (!userBadgeInfo) return false

    return (
      userBadgeInfo.eventsAttended >= badge.requirements.events &&
      userBadgeInfo.volunteeredTimes >= badge.requirements.volunteers &&
      userBadgeInfo.presentationsMade >= badge.requirements.presentations &&
      userBadgeInfo.projectsCompleted >= badge.requirements.projects
    )
  }

  const getNextBadge = () => {
    const currentLevel = userBadgeInfo?.currentLevel || 0
    return badgeLevels.find((badge) => badge.level === currentLevel + 1)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <CardTitle>Connect Wallet to View Badges</CardTitle>
            <CardDescription>Connect your wallet to see your achievement badges</CardDescription>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievement Badges 🏆</h1>
          <p className="text-gray-600">
            Track your progress and unlock exclusive badges by participating in the community
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="collection">My Collection</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Your Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">
                          {badgeLevels.find((b) => b.level === (userBadgeInfo?.currentLevel || 0))?.icon || "🎯"}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            {badgeLevels.find((b) => b.level === (userBadgeInfo?.currentLevel || 0))?.name ||
                              "Getting Started"}
                          </h3>
                          <p className="text-gray-600">Level {userBadgeInfo?.currentLevel || 0} Badge</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{userBadgeInfo?.eventsAttended || 0} Events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span>{userBadgeInfo?.volunteeredTimes || 0} Volunteer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Presentation className="w-4 h-4 text-purple-600" />
                          <span>{userBadgeInfo?.presentationsMade || 0} Presentations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-orange-600" />
                          <span>{userBadgeInfo?.projectsCompleted || 0} Projects</span>
                        </div>
                      </div>
                    </div>

                    {/* Next Badge Preview */}
                    {getNextBadge() && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          Next Badge: {getNextBadge()?.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">{getNextBadge()?.description}</p>
                        <Badge className="bg-blue-100 text-blue-800">+{getNextBadge()?.reward} CDA Reward</Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badgeLevels.map((badge) => {
                const earned = hasEarnedBadge(badge.level)
                const canEarn = canEarnBadge(badge)

                return (
                  <Card
                    key={badge.level}
                    className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      earned
                        ? "ring-2 ring-green-200 bg-green-50"
                        : canEarn
                          ? "ring-2 ring-blue-200 bg-blue-50"
                          : "opacity-75"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{badge.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{badge.name}</CardTitle>
                            <p className="text-sm text-gray-600">Level {badge.level}</p>
                          </div>
                        </div>

                        {earned ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : canEarn ? (
                          <Star className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-700">{badge.description}</p>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-900">Requirements:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {badge.requirements.events > 0 && (
                            <div
                              className={`flex items-center gap-1 ${
                                isRequirementMet(badge.requirements.events, userBadgeInfo?.eventsAttended || 0)
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {badge.requirements.events} events
                            </div>
                          )}
                          {badge.requirements.volunteers > 0 && (
                            <div
                              className={`flex items-center gap-1 ${
                                isRequirementMet(badge.requirements.volunteers, userBadgeInfo?.volunteeredTimes || 0)
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Users className="w-3 h-3" />
                              {badge.requirements.volunteers} volunteer
                            </div>
                          )}
                          {badge.requirements.presentations > 0 && (
                            <div
                              className={`flex items-center gap-1 ${
                                isRequirementMet(
                                  badge.requirements.presentations,
                                  userBadgeInfo?.presentationsMade || 0,
                                )
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Presentation className="w-3 h-3" />
                              {badge.requirements.presentations} presentations
                            </div>
                          )}
                          {badge.requirements.projects > 0 && (
                            <div
                              className={`flex items-center gap-1 ${
                                isRequirementMet(badge.requirements.projects, userBadgeInfo?.projectsCompleted || 0)
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              <Briefcase className="w-3 h-3" />
                              {badge.requirements.projects} projects
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <Badge variant={earned ? "default" : "secondary"}>
                          {earned ? "Earned" : `+${badge.reward} CDA`}
                        </Badge>
                      </div>
                    </CardContent>

                    {earned && (
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Badge Collection</CardTitle>
                <CardDescription>Badges you've earned through your community participation</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badgeLevels
                      .filter((badge) => hasEarnedBadge(badge.level))
                      .map((badge) => (
                        <Card
                          key={badge.level}
                          className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                        >
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">{badge.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{badge.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Level {badge.level} • {badge.reward} CDA
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {!loading && badgeLevels.filter((badge) => hasEarnedBadge(badge.level)).length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No badges earned yet</h3>
                    <p className="text-gray-600">
                      Start participating in events and activities to earn your first badge!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {getNextBadge() ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Progress to {getNextBadge()?.name}
                  </CardTitle>
                  <CardDescription>Track your progress towards earning the next badge level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getNextBadge() && (
                    <>
                      {/* Events Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Events Attended
                          </span>
                          <span className="font-medium">
                            {userBadgeInfo?.eventsAttended || 0} / {getNextBadge()?.requirements.events}
                          </span>
                        </div>
                        <Progress
                          value={getProgress(
                            getNextBadge()?.requirements.events || 1,
                            userBadgeInfo?.eventsAttended || 0,
                          )}
                          className="h-3"
                        />
                      </div>

                      {/* Volunteers Progress */}
                      {(getNextBadge()?.requirements.volunteers || 0) > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-600" />
                              Volunteer Sessions
                            </span>
                            <span className="font-medium">
                              {userBadgeInfo?.volunteeredTimes || 0} / {getNextBadge()?.requirements.volunteers}
                            </span>
                          </div>
                          <Progress
                            value={getProgress(
                              getNextBadge()?.requirements.volunteers || 1,
                              userBadgeInfo?.volunteeredTimes || 0,
                            )}
                            className="h-3"
                          />
                        </div>
                      )}

                      {/* Presentations Progress */}
                      {(getNextBadge()?.requirements.presentations || 0) > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Presentation className="w-4 h-4 text-purple-600" />
                              Presentations Made
                            </span>
                            <span className="font-medium">
                              {userBadgeInfo?.presentationsMade || 0} / {getNextBadge()?.requirements.presentations}
                            </span>
                          </div>
                          <Progress
                            value={getProgress(
                              getNextBadge()?.requirements.presentations || 1,
                              userBadgeInfo?.presentationsMade || 0,
                            )}
                            className="h-3"
                          />
                        </div>
                      )}

                      {/* Projects Progress */}
                      {(getNextBadge()?.requirements.projects || 0) > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-orange-600" />
                              Projects Completed
                            </span>
                            <span className="font-medium">
                              {userBadgeInfo?.projectsCompleted || 0} / {getNextBadge()?.requirements.projects}
                            </span>
                          </div>
                          <Progress
                            value={getProgress(
                              getNextBadge()?.requirements.projects || 1,
                              userBadgeInfo?.projectsCompleted || 0,
                            )}
                            className="h-3"
                          />
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Reward</h4>
                            <p className="text-sm text-gray-600">When you earn this badge</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">+{getNextBadge()?.reward} CDA</Badge>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Maximum Level Achieved!</h3>
                  <p className="text-gray-600">
                    Congratulations! You've earned all available badges. Keep participating to maintain your champion
                    status!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
