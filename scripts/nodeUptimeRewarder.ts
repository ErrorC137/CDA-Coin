import { ethers } from "hardhat"
import type { CDAERC20 } from "../typechain-types"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"

const execAsync = promisify(exec)

interface NodeInfo {
  address: string
  name: string
  endpoint: string
  operatorAddress: string
  lastChecked: number
  uptimeHistory: UptimeRecord[]
}

interface UptimeRecord {
  timestamp: number
  isOnline: boolean
  blockHeight?: number
  responseTime?: number
  syncStatus?: boolean
}

interface MonthlyReward {
  month: string
  nodeAddress: string
  operatorAddress: string
  uptimePercentage: number
  rewardAmount: number
  distributed: boolean
}

class NodeUptimeRewarder {
  private cdaToken: CDAERC20
  private nodes: Map<string, NodeInfo> = new Map()
  private monthlyRewards: MonthlyReward[] = []
  private isMonitoring = false

  constructor(cdaToken: CDAERC20) {
    this.cdaToken = cdaToken
    this.loadNodeConfiguration()
  }

  /**
   * Load node configuration
   */
  private loadNodeConfiguration(): void {
    const defaultNodes: NodeInfo[] = [
      {
        address: "node1",
        name: "CDA Node 1",
        endpoint: "http://node1.cda.local:8545",
        operatorAddress: "0x1234567890123456789012345678901234567890",
        lastChecked: 0,
        uptimeHistory: [],
      },
      {
        address: "node2",
        name: "CDA Node 2",
        endpoint: "http://node2.cda.local:8545",
        operatorAddress: "0x2345678901234567890123456789012345678901",
        lastChecked: 0,
        uptimeHistory: [],
      },
      {
        address: "node3",
        name: "CDA Node 3",
        endpoint: "http://node3.cda.local:8545",
        operatorAddress: "0x3456789012345678901234567890123456789012",
        lastChecked: 0,
        uptimeHistory: [],
      },
      {
        address: "node4",
        name: "CDA Node 4",
        endpoint: "http://node4.cda.local:8545",
        operatorAddress: "0x4567890123456789012345678901234567890123",
        lastChecked: 0,
        uptimeHistory: [],
      },
    ]

    // Load from config file if exists, otherwise use defaults
    const configPath = "config/nodes.json"
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
      config.nodes.forEach((node: NodeInfo) => {
        this.nodes.set(node.address, node)
      })
      console.log(`📂 Loaded ${this.nodes.size} nodes from configuration`)
    } else {
      defaultNodes.forEach((node) => {
        this.nodes.set(node.address, node)
      })
      console.log(`🔧 Using default node configuration (${this.nodes.size} nodes)`)
    }
  }

  /**
   * Start monitoring node uptime
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("⚠️ Monitoring is already running")
      return
    }

    console.log("🖥️ Starting node uptime monitoring...")
    this.isMonitoring = true

    // Check nodes every 5 minutes
    const monitoringInterval = setInterval(
      async () => {
        if (!this.isMonitoring) {
          clearInterval(monitoringInterval)
          return
        }
        await this.checkAllNodes()
      },
      5 * 60 * 1000,
    )

    // Distribute monthly rewards on the 1st of each month
    const rewardInterval = setInterval(
      async () => {
        if (!this.isMonitoring) {
          clearInterval(rewardInterval)
          return
        }

        const now = new Date()
        if (now.getDate() === 1 && now.getHours() === 0) {
          await this.distributeMonthlyRewards()
        }
      },
      60 * 60 * 1000,
    ) // Check every hour

    console.log("✅ Node monitoring started")
  }

  /**
   * Check all nodes for uptime
   */
  async checkAllNodes(): Promise<void> {
    console.log("🔍 Checking node uptime...")

    const checkPromises = Array.from(this.nodes.values()).map((node) => this.checkNodeUptime(node))

    await Promise.allSettled(checkPromises)
    await this.saveUptimeData()
  }

  /**
   * Check individual node uptime
   */
  async checkNodeUptime(node: NodeInfo): Promise<void> {
    const startTime = Date.now()

    try {
      // Check if node is responding
      const response = await fetch(node.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
        timeout: 10000, // 10 second timeout
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        const blockHeight = Number.parseInt(data.result, 16)

        // Check sync status
        const syncResponse = await fetch(node.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_syncing",
            params: [],
            id: 2,
          }),
        })

        const syncData = await syncResponse.json()
        const isSynced = syncData.result === false // false means fully synced

        const uptimeRecord: UptimeRecord = {
          timestamp: Date.now(),
          isOnline: true,
          blockHeight,
          responseTime,
          syncStatus: isSynced,
        }

        node.uptimeHistory.push(uptimeRecord)
        node.lastChecked = Date.now()

        console.log(`✅ ${node.name}: Online (Block: ${blockHeight}, Response: ${responseTime}ms, Synced: ${isSynced})`)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      const uptimeRecord: UptimeRecord = {
        timestamp: Date.now(),
        isOnline: false,
        responseTime: Date.now() - startTime,
      }

      node.uptimeHistory.push(uptimeRecord)
      node.lastChecked = Date.now()

      console.log(`❌ ${node.name}: Offline (${error})`)
    }

    // Keep only last 30 days of history
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    node.uptimeHistory = node.uptimeHistory.filter((record) => record.timestamp > thirtyDaysAgo)
  }

  /**
   * Calculate uptime percentage for a node over a period
   */
  calculateUptimePercentage(node: NodeInfo, startTime: number, endTime: number): number {
    const relevantRecords = node.uptimeHistory.filter(
      (record) => record.timestamp >= startTime && record.timestamp <= endTime,
    )

    if (relevantRecords.length === 0) return 0

    const onlineRecords = relevantRecords.filter((record) => record.isOnline)
    return (onlineRecords.length / relevantRecords.length) * 100
  }

  /**
   * Distribute monthly rewards to node operators
   */
  async distributeMonthlyRewards(): Promise<void> {
    console.log("💰 Distributing monthly node rewards...")

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const monthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`

    // Check if rewards already distributed for this month
    const existingRewards = this.monthlyRewards.filter((r) => r.month === monthKey)
    if (existingRewards.length > 0 && existingRewards.every((r) => r.distributed)) {
      console.log(`⚠️ Rewards for ${monthKey} already distributed`)
      return
    }

    // Calculate uptime for each node
    const nodeRewards: MonthlyReward[] = []
    let totalUptimeScore = 0

    for (const [nodeAddress, node] of this.nodes) {
      const uptimePercentage = this.calculateUptimePercentage(node, lastMonth.getTime(), monthEnd.getTime())

      // Minimum 80% uptime required for rewards
      if (uptimePercentage >= 80) {
        totalUptimeScore += uptimePercentage

        nodeRewards.push({
          month: monthKey,
          nodeAddress,
          operatorAddress: node.operatorAddress,
          uptimePercentage,
          rewardAmount: 0, // Will be calculated based on total pool
          distributed: false,
        })
      } else {
        console.log(`⚠️ ${node.name} below minimum uptime: ${uptimePercentage.toFixed(2)}%`)
      }
    }

    if (nodeRewards.length === 0) {
      console.log("❌ No nodes qualify for rewards this month")
      return
    }

    // Get available node reward allocation
    const nodeAllocation = await this.cdaToken.getRemainingAllocation("node")
    const monthlyPool = nodeAllocation.div(12) // Divide by 12 months

    console.log(`💰 Monthly reward pool: ${ethers.utils.formatEther(monthlyPool)} CDA`)

    // Distribute rewards proportionally based on uptime
    for (const reward of nodeRewards) {
      const rewardShare = reward.uptimePercentage / totalUptimeScore
      const rewardAmount = monthlyPool.mul(Math.floor(rewardShare * 10000)).div(10000)

      reward.rewardAmount = Number.parseFloat(ethers.utils.formatEther(rewardAmount))

      try {
        // Distribute the reward
        await this.cdaToken.distributeReward(
          reward.operatorAddress,
          rewardAmount,
          `Node operator reward - ${reward.uptimePercentage.toFixed(2)}% uptime for ${monthKey}`,
          "node",
        )

        reward.distributed = true
        console.log(
          `✅ Rewarded ${reward.operatorAddress}: ${reward.rewardAmount} CDA (${reward.uptimePercentage.toFixed(2)}% uptime)`,
        )
      } catch (error) {
        console.error(`❌ Failed to distribute reward to ${reward.operatorAddress}:`, error)
      }
    }

    // Save reward records
    this.monthlyRewards.push(...nodeRewards)
    await this.saveRewardData()

    // Generate monthly report
    await this.generateMonthlyReport(monthKey, nodeRewards)
  }

  /**
   * Generate monthly uptime report
   */
  async generateMonthlyReport(month: string, rewards: MonthlyReward[]): Promise<void> {
    console.log(`📊 Generating monthly report for ${month}...`)

    const totalRewards = rewards.reduce((sum, r) => sum + r.rewardAmount, 0)
    const averageUptime = rewards.reduce((sum, r) => sum + r.uptimePercentage, 0) / rewards.length

    const report = {
      month,
      generatedAt: new Date().toISOString(),
      summary: {
        totalNodesEligible: rewards.length,
        totalNodesMonitored: this.nodes.size,
        totalRewardsDistributed: totalRewards,
        averageUptime: averageUptime.toFixed(2) + "%",
        eligibilityThreshold: "80%",
      },
      nodePerformance: rewards.map((r) => {
        const node = Array.from(this.nodes.values()).find((n) => n.operatorAddress === r.operatorAddress)
        return {
          nodeName: node?.name || "Unknown",
          operatorAddress: r.operatorAddress,
          uptimePercentage: r.uptimePercentage.toFixed(2) + "%",
          rewardAmount: r.rewardAmount,
          status: r.distributed ? "Distributed" : "Pending",
        }
      }),
      ineligibleNodes: Array.from(this.nodes.values())
        .filter((node) => !rewards.some((r) => r.operatorAddress === node.operatorAddress))
        .map((node) => ({
          nodeName: node.name,
          operatorAddress: node.operatorAddress,
          reason: "Below 80% uptime threshold",
        })),
    }

    const reportPath = `reports/node-uptime-${month}.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`✅ Monthly report saved to ${reportPath}`)
    console.log(`📈 Average uptime: ${report.summary.averageUptime}`)
    console.log(`💰 Total rewards: ${totalRewards} CDA`)
  }

  /**
   * Get current uptime statistics
   */
  async getUptimeStats(): Promise<{
    nodes: Array<{
      name: string
      address: string
      currentStatus: string
      uptime24h: number
      uptime7d: number
      uptime30d: number
      lastChecked: string
    }>
    overall: {
      totalNodes: number
      onlineNodes: number
      averageUptime24h: number
      averageUptime7d: number
      averageUptime30d: number
    }
  }> {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    const nodeStats = Array.from(this.nodes.values()).map((node) => {
      const uptime24h = this.calculateUptimePercentage(node, now - day, now)
      const uptime7d = this.calculateUptimePercentage(node, now - 7 * day, now)
      const uptime30d = this.calculateUptimePercentage(node, now - 30 * day, now)

      const lastRecord = node.uptimeHistory[node.uptimeHistory.length - 1]
      const currentStatus = lastRecord?.isOnline ? "Online" : "Offline"

      return {
        name: node.name,
        address: node.address,
        currentStatus,
        uptime24h,
        uptime7d,
        uptime30d,
        lastChecked: new Date(node.lastChecked).toISOString(),
      }
    })

    const onlineNodes = nodeStats.filter((n) => n.currentStatus === "Online").length
    const averageUptime24h = nodeStats.reduce((sum, n) => sum + n.uptime24h, 0) / nodeStats.length
    const averageUptime7d = nodeStats.reduce((sum, n) => sum + n.uptime7d, 0) / nodeStats.length
    const averageUptime30d = nodeStats.reduce((sum, n) => sum + n.uptime30d, 0) / nodeStats.length

    return {
      nodes: nodeStats,
      overall: {
        totalNodes: this.nodes.size,
        onlineNodes,
        averageUptime24h,
        averageUptime7d,
        averageUptime30d,
      },
    }
  }

  /**
   * Save uptime data to file
   */
  private async saveUptimeData(): Promise<void> {
    const data = {
      lastUpdated: new Date().toISOString(),
      nodes: Array.from(this.nodes.entries()).map(([address, node]) => ({
        address,
        ...node,
      })),
    }

    fs.writeFileSync("data/node-uptime.json", JSON.stringify(data, null, 2))
  }

  /**
   * Save reward data to file
   */
  private async saveRewardData(): Promise<void> {
    const data = {
      lastUpdated: new Date().toISOString(),
      monthlyRewards: this.monthlyRewards,
    }

    fs.writeFileSync("data/node-rewards.json", JSON.stringify(data, null, 2))
  }

  /**
   * Load existing data
   */
  async loadExistingData(): Promise<void> {
    // Load uptime data
    if (fs.existsSync("data/node-uptime.json")) {
      const uptimeData = JSON.parse(fs.readFileSync("data/node-uptime.json", "utf8"))
      uptimeData.nodes.forEach((nodeData: any) => {
        if (this.nodes.has(nodeData.address)) {
          this.nodes.set(nodeData.address, nodeData)
        }
      })
      console.log("📂 Loaded existing uptime data")
    }

    // Load reward data
    if (fs.existsSync("data/node-rewards.json")) {
      const rewardData = JSON.parse(fs.readFileSync("data/node-rewards.json", "utf8"))
      this.monthlyRewards = rewardData.monthlyRewards || []
      console.log(`📂 Loaded ${this.monthlyRewards.length} reward records`)
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false
    console.log("🛑 Node monitoring stopped")
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean
    totalNodes: number
    lastCheck: string
    totalRewardsDistributed: number
  } {
    const totalRewards = this.monthlyRewards.reduce((sum, r) => sum + r.rewardAmount, 0)
    const lastCheck = Math.max(...Array.from(this.nodes.values()).map((n) => n.lastChecked))

    return {
      isMonitoring: this.isMonitoring,
      totalNodes: this.nodes.size,
      lastCheck: new Date(lastCheck).toISOString(),
      totalRewardsDistributed: totalRewards,
    }
  }
}

// Example usage
async function main() {
  const CDA_TOKEN_ADDRESS = process.env.CDA_TOKEN_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

  if (!CDA_TOKEN_ADDRESS) {
    throw new Error("Please set CDA_TOKEN_ADDRESS environment variable")
  }

  const cdaToken = (await ethers.getContractAt("CDAERC20", CDA_TOKEN_ADDRESS)) as CDAERC20
  const rewarder = new NodeUptimeRewarder(cdaToken)

  // Load existing data
  await rewarder.loadExistingData()

  // Start monitoring
  await rewarder.startMonitoring()

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down node uptime rewarder...")
    rewarder.stopMonitoring()

    // Generate final stats
    const stats = await rewarder.getUptimeStats()
    console.log(`📊 Final stats: ${stats.overall.onlineNodes}/${stats.overall.totalNodes} nodes online`)
    console.log(`📈 30-day average uptime: ${stats.overall.averageUptime30d.toFixed(2)}%`)

    process.exit(0)
  })

  console.log("✅ Node uptime rewarder is running. Press Ctrl+C to stop.")
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Node uptime rewarder failed to start:", error)
    process.exit(1)
  })
}

export { NodeUptimeRewarder }
