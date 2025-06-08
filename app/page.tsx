"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/useWallet"
import { useCDAContract } from "@/hooks/useCDAContract"
import { useAuth } from "@/hooks/useAuth"
import { WalletConnect } from "@/components/WalletConnect"
import { DashboardStats } from "@/components/DashboardStats"
import { ActivityFeed } from "@/components/ActivityFeed"
import { BadgeProgress } from "@/components/BadgeProgress"
import { RecentRedemptions } from "@/components/RecentRedemptions"
import { QRCodeGenerator } from "@/components/QRCodeGenerator"
import { ClaimTokens } from "@/components/ClaimTokens"
import { Leaderboard } from "@/components/Leaderboard"
import { AchievementNotifications } from "@/components/AchievementNotifications"
import { DailyQuests } from "@/components/DailyQuests"
import { StreakCounter } from "@/components/StreakCounter"
import { AdminPanel } from "@/components/AdminPanel"
import { Coins, Trophy, Gift, Users, TrendingUp, Zap, Target, Crown, Sparkles } from "lucide-react"
import { LeaderboardPage } from "@/components/LeaderboardPage"
import { QuestsPage } from "@/components/QuestsPage"

export default function Dashboard() {
  const { isConnected, address } = useWallet()
  const { balance, userBadgeInfo, cycleInfo, loading, refreshData } = useCDAContract(address)
  const { user, isAdmin } = useAuth()
  const [timeUntilReset, setTimeUntilReset] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (cycleInfo?.daysUntilReset) {
      const days = Number.parseInt(cycleInfo.daysUntilReset)
      if (days > 0) {
        setTimeUntilReset(`${days} days until reset`)
      } else {
        setTimeUntilReset("Reset eligible now!")
      }
    }
  }, [cycleInfo])

  // Trigger confetti on achievements
  const handleAchievement = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border-white/20 text-white relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 mb-6 relative">
              <img src="/images/cda-logo.png" alt="CDA Logo" className="w-full h-full object-contain animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur-lg opacity-30 animate-ping"></div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to CDA Coin
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              The ultimate gamified reward system for community engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WalletConnect />

            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl mb-1">🎯</div>
                <p>Earn rewards for participation</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl mb-1">🏆</div>
                <p>Unlock achievement badges</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl mb-1">🛍️</div>
                <p>Redeem exclusive merchandise</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl mb-1">⚡</div>
                <p>Complete daily quests</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                Connect your wallet to start earning CDA tokens and climbing the leaderboard!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="text-center text-white">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
                <Coins className="absolute inset-2 w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-lg">Loading your CDA universe...</p>
              <p className="text-sm text-gray-300 mt-2">Preparing your rewards and achievements</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {["🎉", "🎊", "⭐", "💫", "🏆"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Achievement Notifications */}
      <AchievementNotifications onAchievement={handleAchievement} />

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 relative">
                <img src="/images/cda-logo.png" alt="CDA Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CDA Coin</h1>
                <p className="text-xs text-gray-300">Gamified Rewards</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <StreakCounter />
              <Badge variant="outline" className="text-sm border-yellow-400 text-yellow-400">
                Cycle {cycleInfo?.cycle || "1"}
              </Badge>
              <Badge variant="secondary" className="text-sm bg-purple-600 text-white">
                {timeUntilReset}
              </Badge>
              {isAdmin && (
                <Badge className="bg-red-600 text-white animate-pulse">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Level Display */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl">
              {userBadgeInfo?.currentLevel >= 5
                ? "👑"
                : userBadgeInfo?.currentLevel >= 4
                  ? "🏆"
                  : userBadgeInfo?.currentLevel >= 3
                    ? "⭐"
                    : userBadgeInfo?.currentLevel >= 2
                      ? "🎯"
                      : userBadgeInfo?.currentLevel >= 1
                        ? "🌟"
                        : "🚀"}
            </div>
            <div className="text-left">
              <h2 className="text-4xl font-bold text-white mb-2">
                Welcome back, Champion!
                <Sparkles className="inline w-8 h-8 text-yellow-400 ml-2" />
              </h2>
              <p className="text-gray-300 text-lg">
                Level {userBadgeInfo?.currentLevel || 0} • {balance} CDA •{userBadgeInfo?.eventsAttended || 0} events
                attended
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ClaimTokens />
          <QRCodeGenerator balance={balance} address={address} />
          <Button className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Daily Quest</span>
            </div>
          </Button>
          <Button className="h-20 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Challenges</span>
            </div>
          </Button>
        </div>

        {/* Stats Overview */}
        <DashboardStats balance={balance} userBadgeInfo={userBadgeInfo} cycleInfo={cycleInfo} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Trophy className="w-4 h-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="redeem" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Gift className="w-4 h-4" />
              Store
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Users className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center gap-2 data-[state=active]:bg-white/20">
              <Zap className="w-4 h-4" />
              Quests
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2 data-[state=active]:bg-red-500/50">
                <Crown className="w-4 h-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BadgeProgress userBadgeInfo={userBadgeInfo} />
                <DailyQuests />
              </div>
              <div className="space-y-6">
                <ActivityFeed address={address} />
                <Leaderboard currentUser={address} />
              </div>
            </div>
            <div className="mt-6">
              <RecentRedemptions address={address} />
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-6">
            <BadgeProgress userBadgeInfo={userBadgeInfo} />
          </TabsContent>

          <TabsContent value="redeem" className="mt-6">
            <RecentRedemptions address={address} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <LeaderboardPage currentUser={address} />
          </TabsContent>

          <TabsContent value="quests" className="mt-6">
            <QuestsPage />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
