import { ethers } from "hardhat"
import type { SwagRedemption } from "../typechain-types"
import fs from "fs"

interface RedemptionRecord {
  redemptionId: number
  user: string
  itemId: number
  itemName: string
  cdaCost: number
  timestamp: number
  fulfilled: boolean
  shippingInfo: string
}

class SwagBurnTracker {
  private swagRedemption: SwagRedemption
  private trackingData: RedemptionRecord[] = []

  constructor(swagRedemption: SwagRedemption) {
    this.swagRedemption = swagRedemption
  }

  /**
   * Start tracking swag redemptions
   */
  async startTracking(): Promise<void> {
    console.log("🛍️ Starting swag burn tracking...")

    // Listen for redemption events
    this.swagRedemption.on("SwagRedeemed", async (redemptionId, user, itemId, cdaCost, event) => {
      console.log(`🔥 New redemption detected: ID ${redemptionId}`)
      await this.recordRedemption(redemptionId, user, itemId, cdaCost, event)
    })

    // Listen for fulfillment events
    this.swagRedemption.on("RedemptionFulfilled", async (redemptionId, user, event) => {
      console.log(`📦 Redemption fulfilled: ID ${redemptionId}`)
      await this.updateFulfillmentStatus(redemptionId, true)
    })

    console.log("✅ Swag burn tracking started")
  }

  /**
   * Record a new redemption
   */
  async recordRedemption(
    redemptionId: ethers.BigNumber,
    user: string,
    itemId: ethers.BigNumber,
    cdaCost: ethers.BigNumber,
    event: any,
  ): Promise<void> {
    try {
      // Get redemption details
      const redemption = await this.swagRedemption.redemptions(redemptionId)
      const swagItem = await this.swagRedemption.swagItems(itemId)

      const record: RedemptionRecord = {
        redemptionId: redemptionId.toNumber(),
        user: user,
        itemId: itemId.toNumber(),
        itemName: swagItem.name,
        cdaCost: Number.parseFloat(ethers.utils.formatEther(cdaCost)),
        timestamp: redemption.timestamp.toNumber(),
        fulfilled: redemption.fulfilled,
        shippingInfo: redemption.shippingInfo,
      }

      this.trackingData.push(record)
      await this.saveTrackingData()

      console.log(`📝 Recorded redemption: ${record.itemName} for ${record.cdaCost} CDA`)

      // Send notification (in production, this could be Discord/Slack webhook)
      await this.sendRedemptionNotification(record)
    } catch (error) {
      console.error("❌ Failed to record redemption:", error)
    }
  }

  /**
   * Update fulfillment status
   */
  async updateFulfillmentStatus(redemptionId: ethers.BigNumber, fulfilled: boolean): Promise<void> {
    const id = redemptionId.toNumber()
    const recordIndex = this.trackingData.findIndex((r) => r.redemptionId === id)

    if (recordIndex !== -1) {
      this.trackingData[recordIndex].fulfilled = fulfilled
      await this.saveTrackingData()
      console.log(`✅ Updated fulfillment status for redemption ${id}`)
    }
  }

  /**
   * Get redemption statistics
   */
  async getRedemptionStats(): Promise<{
    totalRedemptions: number
    totalCDABurned: number
    fulfilledRedemptions: number
    pendingRedemptions: number
    topItems: Array<{ itemName: string; count: number; totalCDA: number }>
    monthlyStats: Array<{ month: string; redemptions: number; cdaBurned: number }>
  }> {
    const stats = {
      totalRedemptions: this.trackingData.length,
      totalCDABurned: this.trackingData.reduce((sum, r) => sum + r.cdaCost, 0),
      fulfilledRedemptions: this.trackingData.filter((r) => r.fulfilled).length,
      pendingRedemptions: this.trackingData.filter((r) => !r.fulfilled).length,
      topItems: [] as Array<{ itemName: string; count: number; totalCDA: number }>,
      monthlyStats: [] as Array<{ month: string; redemptions: number; cdaBurned: number }>,
    }

    // Calculate top items
    const itemStats = this.trackingData.reduce(
      (acc, r) => {
        if (!acc[r.itemName]) {
          acc[r.itemName] = { count: 0, totalCDA: 0 }
        }
        acc[r.itemName].count++
        acc[r.itemName].totalCDA += r.cdaCost
        return acc
      },
      {} as Record<string, { count: number; totalCDA: number }>,
    )

    stats.topItems = Object.entries(itemStats)
      .map(([itemName, data]) => ({ itemName, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate monthly stats
    const monthlyData = this.trackingData.reduce(
      (acc, r) => {
        const date = new Date(r.timestamp * 1000)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!acc[monthKey]) {
          acc[monthKey] = { redemptions: 0, cdaBurned: 0 }
        }
        acc[monthKey].redemptions++
        acc[monthKey].cdaBurned += r.cdaCost
        return acc
      },
      {} as Record<string, { redemptions: number; cdaBurned: number }>,
    )

    stats.monthlyStats = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return stats
  }

  /**
   * Generate burn report
   */
  async generateBurnReport(): Promise<void> {
    console.log("📊 Generating swag burn report...")

    const stats = await this.getRedemptionStats()
    const currentDate = new Date().toISOString().split("T")[0]

    const report = {
      generatedAt: new Date().toISOString(),
      reportPeriod: "All time",
      summary: {
        totalRedemptions: stats.totalRedemptions,
        totalCDABurned: stats.totalCDABurned,
        averageCDAPerRedemption:
          stats.totalRedemptions > 0 ? (stats.totalCDABurned / stats.totalRedemptions).toFixed(2) : 0,
        fulfillmentRate:
          stats.totalRedemptions > 0
            ? ((stats.fulfilledRedemptions / stats.totalRedemptions) * 100).toFixed(2) + "%"
            : "0%",
        pendingFulfillments: stats.pendingRedemptions,
      },
      topItems: stats.topItems,
      monthlyTrends: stats.monthlyStats,
      recentRedemptions: this.trackingData
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20)
        .map((r) => ({
          date: new Date(r.timestamp * 1000).toISOString().split("T")[0],
          user: `${r.user.slice(0, 6)}...${r.user.slice(-4)}`,
          item: r.itemName,
          cost: r.cdaCost,
          fulfilled: r.fulfilled,
        })),
    }

    // Save report
    const reportPath = `reports/swag-burn-report-${currentDate}.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`✅ Burn report saved to ${reportPath}`)
    console.log(`🔥 Total CDA burned: ${report.summary.totalCDABurned}`)
    console.log(`📦 Fulfillment rate: ${report.summary.fulfillmentRate}`)
    console.log(`⏳ Pending fulfillments: ${report.summary.pendingFulfillments}`)
  }

  /**
   * Export redemptions to CSV
   */
  async exportToCSV(): Promise<void> {
    console.log("📄 Exporting redemptions to CSV...")

    const csvHeader = "Redemption ID,User,Item Name,CDA Cost,Date,Fulfilled,Shipping Info\n"
    const csvRows = this.trackingData
      .map(
        (r) =>
          `${r.redemptionId},"${r.user}","${r.itemName}",${r.cdaCost},"${new Date(r.timestamp * 1000).toISOString()}",${r.fulfilled},"${r.shippingInfo.replace(/"/g, '""')}"`,
      )
      .join("\n")

    const csvContent = csvHeader + csvRows
    const filename = `exports/swag-redemptions-${Date.now()}.csv`

    fs.writeFileSync(filename, csvContent)
    console.log(`✅ CSV exported to ${filename}`)
  }

  /**
   * Check for unfulfilled redemptions older than X days
   */
  async checkOverdueRedemptions(daysThreshold = 7): Promise<RedemptionRecord[]> {
    const thresholdTimestamp = Math.floor(Date.now() / 1000) - daysThreshold * 24 * 60 * 60

    const overdueRedemptions = this.trackingData.filter((r) => !r.fulfilled && r.timestamp < thresholdTimestamp)

    if (overdueRedemptions.length > 0) {
      console.log(`⚠️ Found ${overdueRedemptions.length} overdue redemptions (>${daysThreshold} days)`)

      // Send alert notification
      await this.sendOverdueAlert(overdueRedemptions)
    }

    return overdueRedemptions
  }

  /**
   * Send redemption notification
   */
  private async sendRedemptionNotification(record: RedemptionRecord): Promise<void> {
    // In production, this would send to Discord/Slack/Email
    console.log(`🔔 NOTIFICATION: New redemption - ${record.itemName} by ${record.user.slice(0, 8)}...`)

    // Example webhook payload (Discord format)
    const webhookPayload = {
      embeds: [
        {
          title: "🛍️ New Swag Redemption",
          color: 0x00ff00,
          fields: [
            { name: "Item", value: record.itemName, inline: true },
            { name: "Cost", value: `${record.cdaCost} CDA`, inline: true },
            { name: "User", value: `${record.user.slice(0, 8)}...`, inline: true },
            { name: "Redemption ID", value: record.redemptionId.toString(), inline: true },
          ],
          timestamp: new Date(record.timestamp * 1000).toISOString(),
        },
      ],
    }

    // In production: await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', body: JSON.stringify(webhookPayload) });
  }

  /**
   * Send overdue alert
   */
  private async sendOverdueAlert(overdueRedemptions: RedemptionRecord[]): Promise<void> {
    console.log(`🚨 ALERT: ${overdueRedemptions.length} overdue redemptions need attention!`)

    // In production, send to admin channels
    const alertPayload = {
      embeds: [
        {
          title: "⚠️ Overdue Redemptions Alert",
          color: 0xff0000,
          description: `${overdueRedemptions.length} redemptions are overdue and need fulfillment.`,
          fields: overdueRedemptions.slice(0, 10).map((r) => ({
            name: `ID ${r.redemptionId} - ${r.itemName}`,
            value: `User: ${r.user.slice(0, 8)}...\nDays overdue: ${Math.floor((Date.now() / 1000 - r.timestamp) / 86400)}`,
            inline: true,
          })),
        },
      ],
    }
  }

  /**
   * Save tracking data to file
   */
  private async saveTrackingData(): Promise<void> {
    const dataPath = "data/swag-tracking.json"
    fs.writeFileSync(dataPath, JSON.stringify(this.trackingData, null, 2))
  }

  /**
   * Load existing tracking data
   */
  async loadTrackingData(): Promise<void> {
    const dataPath = "data/swag-tracking.json"

    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, "utf8")
      this.trackingData = JSON.parse(data)
      console.log(`📂 Loaded ${this.trackingData.length} existing redemption records`)
    }
  }
}

// Example usage
async function main() {
  const SWAG_REDEMPTION_ADDRESS = process.env.SWAG_REDEMPTION_ADDRESS || ""

  if (!SWAG_REDEMPTION_ADDRESS) {
    throw new Error("Please set SWAG_REDEMPTION_ADDRESS environment variable")
  }

  const swagRedemption = (await ethers.getContractAt("SwagRedemption", SWAG_REDEMPTION_ADDRESS)) as SwagRedemption
  const tracker = new SwagBurnTracker(swagRedemption)

  // Load existing data
  await tracker.loadTrackingData()

  // Start tracking
  await tracker.startTracking()

  // Generate reports
  await tracker.generateBurnReport()
  await tracker.exportToCSV()

  // Check for overdue redemptions
  await tracker.checkOverdueRedemptions(7)

  console.log("🛍️ Swag burn tracker is running...")
}

if (require.main === module) {
  main()
    .then(() => {
      // Keep the process running to listen for events
      console.log("✅ Tracker started successfully. Press Ctrl+C to stop.")
    })
    .catch((error) => {
      console.error("❌ Tracker failed to start:", error)
      process.exit(1)
    })
}

export { SwagBurnTracker }
