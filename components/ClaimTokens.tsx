"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Gift, Sparkles, Clock, CheckCircle } from "lucide-react"

export function ClaimTokens() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [lastClaimed, setLastClaimed] = useState<Date | null>(null)
  const [claimAmount] = useState(50) // Daily claim amount
  const { toast } = useToast()

  const canClaim = () => {
    if (!lastClaimed) return true
    const now = new Date()
    const timeDiff = now.getTime() - lastClaimed.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    return hoursDiff >= 24
  }

  const getTimeUntilNextClaim = () => {
    if (!lastClaimed) return "Available now!"
    const now = new Date()
    const nextClaim = new Date(lastClaimed.getTime() + 24 * 60 * 60 * 1000)
    const timeDiff = nextClaim.getTime() - now.getTime()

    if (timeDiff <= 0) return "Available now!"

    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const handleClaim = async () => {
    if (!canClaim()) return

    setIsClaiming(true)
    try {
      // Simulate claiming process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setLastClaimed(new Date())

      toast({
        title: "Tokens Claimed! 🎉",
        description: `You received ${claimAmount} CDA tokens!`,
      })

      // Trigger confetti effect
      const event = new CustomEvent("achievement", {
        detail: { type: "claim", amount: claimAmount },
      })
      window.dispatchEvent(event)
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "There was an error claiming your tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`h-20 relative overflow-hidden ${
            canClaim()
              ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 animate-pulse"
              : "bg-gray-600 hover:bg-gray-700"
          } text-white`}
          disabled={!canClaim()}
        >
          <div className="text-center relative z-10">
            {canClaim() ? (
              <>
                <Gift className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-bold">Claim {claimAmount}</span>
                <div className="text-xs">Daily Reward</div>
              </>
            ) : (
              <>
                <Clock className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Next Claim</span>
                <div className="text-xs">{getTimeUntilNextClaim()}</div>
              </>
            )}
          </div>

          {canClaim() && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-ping"></div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-lg border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Daily Token Claim
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Claim your daily CDA tokens to boost your balance!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Claim Visualization */}
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">{claimAmount} CDA</h3>
              <p className="text-gray-300">Daily Reward Available</p>

              {lastClaimed && (
                <div className="mt-4 text-sm text-gray-400">Last claimed: {lastClaimed.toLocaleDateString()}</div>
              )}
            </CardContent>
          </Card>

          {/* Claim Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <span className="text-sm">Daily Claim Status</span>
              <Badge variant={canClaim() ? "default" : "secondary"}>
                {canClaim() ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    {getTimeUntilNextClaim()}
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <span className="text-sm">Claim Amount</span>
              <Badge className="bg-yellow-600">{claimAmount} CDA</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <span className="text-sm">Next Claim</span>
              <span className="text-sm text-gray-300">{canClaim() ? "Now!" : getTimeUntilNextClaim()}</span>
            </div>
          </div>

          {/* Claim Button */}
          <Button
            onClick={handleClaim}
            disabled={!canClaim() || isClaiming}
            className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold"
          >
            {isClaiming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Claiming...
              </>
            ) : canClaim() ? (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Claim {claimAmount} CDA
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Available in {getTimeUntilNextClaim()}
              </>
            )}
          </Button>

          {/* Bonus Info */}
          <div className="text-center text-xs text-gray-400">💡 Tip: Complete daily quests for bonus tokens!</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
