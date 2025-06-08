"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Crown, Coins, Gift, Users, Settings, Plus, Send, Package, BarChart3, Shield } from "lucide-react"

export function AdminPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Token Distribution
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")

  // Merchandise Management
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemCost, setItemCost] = useState("")
  const [itemSupply, setItemSupply] = useState("")
  const [minBadgeLevel, setMinBadgeLevel] = useState("")

  // User Management
  const [userAddress, setUserAddress] = useState("")
  const [activityType, setActivityType] = useState("event")
  const [activityCount, setActivityCount] = useState("")

  const handleSendTokens = async () => {
    if (!recipient || !amount || !reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate sending tokens
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Tokens Sent Successfully! 💰",
        description: `Sent ${amount} CDA to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      })

      setRecipient("")
      setAmount("")
      setReason("")
    } catch (error) {
      toast({
        title: "Failed to Send Tokens",
        description: "There was an error sending tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMerchandise = async () => {
    if (!itemName || !itemDescription || !itemCost || !itemSupply) {
      toast({
        title: "Missing Information",
        description: "Please fill in all merchandise fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate adding merchandise
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Merchandise Added! 🛍️",
        description: `${itemName} has been added to the store`,
      })

      setItemName("")
      setItemDescription("")
      setItemCost("")
      setItemSupply("")
      setMinBadgeLevel("")
    } catch (error) {
      toast({
        title: "Failed to Add Merchandise",
        description: "There was an error adding the item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordActivity = async () => {
    if (!userAddress || !activityCount) {
      toast({
        title: "Missing Information",
        description: "Please fill in user address and activity count",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate recording activity
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Activity Recorded! 📊",
        description: `Recorded ${activityCount} ${activityType}(s) for ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
      })

      setUserAddress("")
      setActivityCount("")
    } catch (error) {
      toast({
        title: "Failed to Record Activity",
        description: "There was an error recording the activity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="bg-gradient-to-r from-red-600/20 to-pink-600/20 backdrop-blur-lg border-red-400/30 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Admin Control Panel
          </CardTitle>
          <CardDescription className="text-gray-300">Manage tokens, merchandise, and user activities</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-lg">
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="merchandise" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Merchandise
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Token Management */}
        <TabsContent value="tokens">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Token Distribution
              </CardTitle>
              <CardDescription className="text-gray-300">
                Send CDA tokens to users for rewards and incentives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (CDA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Distribution</Label>
                <Input
                  id="reason"
                  placeholder="Event participation reward"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <Button
                onClick={handleSendTokens}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Tokens
                  </>
                )}
              </Button>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAmount("50")
                    setReason("Event attendance")
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Event (50)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAmount("100")
                    setReason("Volunteer work")
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Volunteer (100)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAmount("200")
                    setReason("Presentation")
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Presentation (200)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAmount("500")
                    setReason("Project completion")
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Project (500)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merchandise Management */}
        <TabsContent value="merchandise">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-400" />
                Merchandise Management
              </CardTitle>
              <CardDescription className="text-gray-300">Add new merchandise items to the store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="CDA T-Shirt"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemCost">Cost (CDA)</Label>
                  <Input
                    id="itemCost"
                    type="number"
                    placeholder="500"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea
                  id="itemDescription"
                  placeholder="High-quality CDA branded t-shirt..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemSupply">Total Supply</Label>
                  <Input
                    id="itemSupply"
                    type="number"
                    placeholder="100"
                    value={itemSupply}
                    onChange={(e) => setItemSupply(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBadgeLevel">Min Badge Level</Label>
                  <Input
                    id="minBadgeLevel"
                    type="number"
                    placeholder="1"
                    value={minBadgeLevel}
                    onChange={(e) => setMinBadgeLevel(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddMerchandise}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Merchandise
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Activity Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Record user activities and manage badge progression
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userAddress">User Address</Label>
                <Input
                  id="userAddress"
                  placeholder="0x..."
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activityType">Activity Type</Label>
                  <select
                    id="activityType"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                  >
                    <option value="event">Event Attendance</option>
                    <option value="volunteer">Volunteer Work</option>
                    <option value="presentation">Presentation</option>
                    <option value="project">Project Completion</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityCount">Count</Label>
                  <Input
                    id="activityCount"
                    type="number"
                    placeholder="1"
                    value={activityCount}
                    onChange={(e) => setActivityCount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                onClick={handleRecordActivity}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Activity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">1,247</div>
                <p className="text-sm text-gray-300">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Tokens Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">45,230</div>
                <p className="text-sm text-gray-300">This cycle</p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">892</div>
                <p className="text-sm text-gray-300">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Events Hosted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">156</div>
                <p className="text-sm text-gray-300">This year</p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Merchandise Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-pink-400">324</div>
                <p className="text-sm text-gray-300">Items redeemed</p>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Badge Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Level 5</span>
                    <Badge className="bg-red-600">23</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Level 4</span>
                    <Badge className="bg-orange-600">67</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Level 3</span>
                    <Badge className="bg-purple-600">145</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                System Settings
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure system parameters and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Token Settings</h3>
                  <div className="space-y-2">
                    <Label>Daily Claim Amount</Label>
                    <Input defaultValue="50" className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Daily Claims</Label>
                    <Input defaultValue="1" className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Badge Settings</h3>
                  <div className="space-y-2">
                    <Label>Auto Badge Assignment</Label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Enable automatic badge progression</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Badge Notification</Label>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Send notifications on badge unlock</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
