"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

interface BadgeProgressProps {
  userBadgeInfo: any
}

export function BadgeProgress({ userBadgeInfo }: BadgeProgressProps) {
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

  return (
    <div className="space-y-6">
      {/* Current Badge Status */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Your Badge Progress
          </CardTitle>
          <CardDescription className="text-gray-300">
            Track your achievements and unlock new badge levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Badge */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {badgeLevels.find((b) => b.level === (userBadgeInfo?.currentLevel || 0))?.icon || "🎯"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {badgeLevels.find((b) => b.level === (userBadgeInfo?.currentLevel || 0))?.name || "Getting Started"}
                  </h3>
                  <p className="text-gray-300">Level {userBadgeInfo?.currentLevel || 0} Badge</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{userBadgeInfo?.eventsAttended || 0} Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>{userBadgeInfo?.volunteeredTimes || 0} Volunteer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-purple-400" />
                  <span>{userBadgeInfo?.presentationsMade || 0} Presentations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-400" />
                  <span>{userBadgeInfo?.projectsCompleted || 0} Projects</span>
                </div>
              </div>
            </div>

            {/* Next Badge Preview */}
            {getNextBadge() && (
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Next: {getNextBadge()?.name}
                </h4>
                <p className="text-sm text-gray-300 mb-3">{getNextBadge()?.description}</p>
                <Badge className="bg-blue-600 text-white">+{getNextBadge()?.reward} CDA Reward</Badge>
              </div>
            )}
          </div>

          {/* Progress to Next Badge */}
          {getNextBadge() && (
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-semibold text-white">Progress to {getNextBadge()?.name}</h4>

              {/* Events Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Events Attended
                  </span>
                  <span className="font-medium text-white">
                    {userBadgeInfo?.eventsAttended || 0} / {getNextBadge()?.requirements.events}
                  </span>
                </div>
                <Progress
                  value={getProgress(getNextBadge()?.requirements.events || 1, userBadgeInfo?.eventsAttended || 0)}
                  className="h-3"
                />
              </div>

              {/* Volunteers Progress */}
              {(getNextBadge()?.requirements.volunteers || 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4 text-green-400" />
                      Volunteer Sessions
                    </span>
                    <span className="font-medium text-white">
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
                    <span className="flex items-center gap-2 text-gray-300">
                      <Presentation className="w-4 h-4 text-purple-400" />
                      Presentations Made
                    </span>
                    <span className="font-medium text-white">
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
                    <span className="flex items-center gap-2 text-gray-300">
                      <Briefcase className="w-4 h-4 text-orange-400" />
                      Projects Completed
                    </span>
                    <span className="font-medium text-white">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badgeLevels.map((badge) => {
          const earned = hasEarnedBadge(badge.level)
          const canEarn = canEarnBadge(badge)

          return (
            <Card
              key={badge.level}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                earned
                  ? "ring-2 ring-green-400/50 bg-green-500/10"
                  : canEarn
                    ? "ring-2 ring-blue-400/50 bg-blue-500/10"
                    : "bg-black/20 opacity-75"
              } backdrop-blur-lg border-white/10 text-white`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <h4 className="font-bold text-white">{badge.name}</h4>
                      <p className="text-xs text-gray-300">Level {badge.level}</p>
                    </div>
                  </div>

                  {earned ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : canEarn ? (
                    <Star className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                <p className="text-xs text-gray-300 mb-3">{badge.description}</p>

                <div className="flex justify-between items-center">
                  <Badge variant={earned ? "default" : "secondary"} className="text-xs">
                    {earned ? "Earned" : `+${badge.reward} CDA`}
                  </Badge>
                  {!earned && <div className="text-xs text-gray-400">{badge.requirements.events} events needed</div>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
