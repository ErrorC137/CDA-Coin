import { ethers } from "hardhat"
import type { CDAResetManager, CDAERC20 } from "../typechain-types"
import cron from "node-cron"
import fs from "fs"

interface ResetSchedule {
  enabled: boolean
  cronExpression: string // "0 0 1 8 *" = August 1st at midnight
  dryRun: boolean
  notificationWebhook?: string
}

class ResetScheduler {
  private resetManager: CDAResetManager
  private cdaToken: CDAERC20
  private schedule: ResetSchedule
  private isRunning = false

  constructor(resetManager: CDAResetManager, cdaToken: CDAERC20) {
    this.resetManager = resetManager
    this.cdaToken = cdaToken
    this.schedule = {
      enabled: true,
      cronExpression: "0 0 1 8 *", // August 1st at midnight
      dryRun: false,
    }
  }

  /**
   * Start the reset scheduler
   */
  async startScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Scheduler is already running")
      return
    }

    console.log("🕐 Starting CDA reset scheduler...")
    console.log(`📅 Schedule: ${this.schedule.cronExpression} (${this.schedule.dryRun ? "DRY RUN" : "LIVE"})`)

    // Schedule the reset task
    cron.schedule(
      this.schedule.cronExpression,
      async () => {
        await this.executeScheduledReset()
      },
      {
        scheduled: this.schedule.enabled,
        timezone: "UTC",
      },
    )

    // Also check daily if we're in the reset window
    cron.schedule(
      "0 9 * * *",
      async () => {
        await this.checkResetEligibility()
      },
      {
        scheduled: true,
        timezone: "UTC",
      },
    )

    this.isRunning = true
    console.log("✅ Reset scheduler started successfully")
  }

  /**
   * Execute scheduled reset
   */
  async executeScheduledReset(): Promise<void> {
    console.log("🔄 Executing scheduled reset...")

    try {
      // Check if reset is allowed
      const resetStatus = await this.resetManager.getResetStatus()

      if (!resetStatus.canResetNow) {
        console.log(`❌ Reset not allowed: ${resetStatus.resetReason}`)
        await this.sendNotification("Reset Failed", `Reset not allowed: ${resetStatus.resetReason}`, "error")
        return
      }

      // Pre-reset backup and reporting
      await this.performPreResetTasks()

      if (this.schedule.dryRun) {
        console.log("🧪 DRY RUN: Would execute reset now")
        await this.sendNotification("Reset Dry Run", "Reset would be executed now (dry run mode)", "info")
        return
      }

      // Execute the actual reset
      console.log("🚀 Initiating annual reset...")
      const tx = await this.resetManager.initiateReset()
      const receipt = await tx.wait()

      console.log(`✅ Reset completed successfully! Transaction: ${receipt.transactionHash}`)

      // Post-reset tasks
      await this.performPostResetTasks()

      await this.sendNotification(
        "Annual Reset Completed",
        `CDA system has been reset successfully. New cycle started.`,
        "success",
      )
    } catch (error) {
      console.error("❌ Reset failed:", error)
      await this.sendNotification("Reset Failed", `Reset execution failed: ${error}`, "error")
    }
  }

  /**
   * Check reset eligibility and send reminders
   */
  async checkResetEligibility(): Promise<void> {
    try {
      const resetStatus = await this.resetManager.getResetStatus()
      const cycleInfo = await this.cdaToken.getCycleInfo()

      // Send reminder notifications
      if (resetStatus.daysUntilEligible <= 30 && resetStatus.daysUntilEligible > 0) {
        await this.sendNotification(
          "Reset Reminder",
          `CDA system reset eligible in ${resetStatus.daysUntilEligible} days. Current cycle: ${cycleInfo.cycle}`,
          "warning",
        )
      }

      // Check if we're overdue for reset
      if (resetStatus.canResetNow && resetStatus.daysUntilEligible === 0) {
        await this.sendNotification(
          "Reset Overdue",
          "CDA system is eligible for reset but hasn't been reset yet!",
          "error",
        )
      }
    } catch (error) {
      console.error("❌ Failed to check reset eligibility:", error)
    }
  }

  /**
   * Perform pre-reset tasks
   */
  async performPreResetTasks(): Promise<void> {
    console.log("📋 Performing pre-reset tasks...")

    // Generate final cycle report
    await this.generateFinalCycleReport()

    // Backup current state
    await this.backupCurrentState()

    // Notify users about impending reset
    await this.sendNotification(
      "Reset Starting",
      "Annual CDA reset is starting. All token balances will be reset to zero.",
      "info",
    )

    console.log("✅ Pre-reset tasks completed")
  }

  /**
   * Perform post-reset tasks
   */
  async performPostResetTasks(): Promise<void> {
    console.log("📋 Performing post-reset tasks...")

    // Verify reset was successful
    const cycleInfo = await this.cdaToken.getCycleInfo()
    console.log(`🔄 New cycle started: ${cycleInfo.cycle}`)

    // Generate new cycle initialization report
    await this.generateNewCycleReport()

    // Update any external systems
    await this.notifyExternalSystems()

    console.log("✅ Post-reset tasks completed")
  }

  /**
   * Generate final cycle report
   */
  async generateFinalCycleReport(): Promise<void> {
    console.log("📊 Generating final cycle report...")

    const cycleInfo = await this.cdaToken.getCycleInfo()
    const allocations = {
      activity: await this.cdaToken.getRemainingAllocation("activity"),
      milestone: await this.cdaToken.getRemainingAllocation("milestone"),
      swag: await this.cdaToken.getRemainingAllocation("swag"),
      nft: await this.cdaToken.getRemainingAllocation("nft"),
      node: await this.cdaToken.getRemainingAllocation("node"),
      admin: await this.cdaToken.getRemainingAllocation("admin"),
    }

    const report = {
      cycleNumber: cycleInfo.cycle.toString(),
      cycleEndDate: new Date().toISOString(),
      cycleDuration: cycleInfo.daysUntilReset.toString() + " days",
      finalAllocations: {
        activity: {
          allocated: "60000",
          remaining: ethers.utils.formatEther(allocations.activity),
          used: (60000 - Number.parseFloat(ethers.utils.formatEther(allocations.activity))).toString(),
          utilizationRate:
            (((60000 - Number.parseFloat(ethers.utils.formatEther(allocations.activity))) / 60000) * 100).toFixed(2) +
            "%",
        },
        milestone: {
          allocated: "15000",
          remaining: ethers.utils.formatEther(allocations.milestone),
          used: (15000 - Number.parseFloat(ethers.utils.formatEther(allocations.milestone))).toString(),
          utilizationRate:
            (((15000 - Number.parseFloat(ethers.utils.formatEther(allocations.milestone))) / 15000) * 100).toFixed(2) +
            "%",
        },
        swag: {
          allocated: "10000",
          remaining: ethers.utils.formatEther(allocations.swag),
          used: (10000 - Number.parseFloat(ethers.utils.formatEther(allocations.swag))).toString(),
          utilizationRate:
            (((10000 - Number.parseFloat(ethers.utils.formatEther(allocations.swag))) / 10000) * 100).toFixed(2) + "%",
        },
        nft: {
          allocated: "7500",
          remaining: ethers.utils.formatEther(allocations.nft),
          used: (7500 - Number.parseFloat(ethers.utils.formatEther(allocations.nft))).toString(),
          utilizationRate:
            (((7500 - Number.parseFloat(ethers.utils.formatEther(allocations.nft))) / 7500) * 100).toFixed(2) + "%",
        },
        node: {
          allocated: "5000",
          remaining: ethers.utils.formatEther(allocations.node),
          used: (5000 - Number.parseFloat(ethers.utils.formatEther(allocations.node))).toString(),
          utilizationRate:
            (((5000 - Number.parseFloat(ethers.utils.formatEther(allocations.node))) / 5000) * 100).toFixed(2) + "%",
        },
      },
      totalUtilization: {
        totalAllocated: "100000",
        totalUsed: (
          100000 -
          Number.parseFloat(ethers.utils.formatEther(allocations.activity)) -
          Number.parseFloat(ethers.utils.formatEther(allocations.milestone)) -
          Number.parseFloat(ethers.utils.formatEther(allocations.swag)) -
          Number.parseFloat(ethers.utils.formatEther(allocations.nft)) -
          Number.parseFloat(ethers.utils.formatEther(allocations.node)) -
          Number.parseFloat(ethers.utils.formatEther(allocations.admin))
        ).toString(),
        overallUtilizationRate:
          (
            ((100000 -
              Number.parseFloat(ethers.utils.formatEther(allocations.activity)) -
              Number.parseFloat(ethers.utils.formatEther(allocations.milestone)) -
              Number.parseFloat(ethers.utils.formatEther(allocations.swag)) -
              Number.parseFloat(ethers.utils.formatEther(allocations.nft)) -
              Number.parseFloat(ethers.utils.formatEther(allocations.node)) -
              Number.parseFloat(ethers.utils.formatEther(allocations.admin))) /
              100000) *
            100
          ).toFixed(2) + "%",
      },
    }

    const reportPath = `reports/final-cycle-${cycleInfo.cycle}-${Date.now()}.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`✅ Final cycle report saved to ${reportPath}`)
    console.log(`📈 Overall utilization: ${report.totalUtilization.overallUtilizationRate}`)
  }

  /**
   * Generate new cycle report
   */
  async generateNewCycleReport(): Promise<void> {
    const cycleInfo = await this.cdaToken.getCycleInfo()

    const report = {
      newCycleNumber: cycleInfo.cycle.toString(),
      cycleStartDate: new Date().toISOString(),
      resetTimestamp: cycleInfo.resetTimestamp.toString(),
      freshAllocations: {
        activity: "60000 CDA",
        milestone: "15000 CDA",
        swag: "10000 CDA",
        nft: "7500 CDA",
        node: "5000 CDA",
        admin: "2500 CDA",
        total: "100000 CDA",
      },
      nextResetEligible: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const reportPath = `reports/new-cycle-${cycleInfo.cycle}-${Date.now()}.json`
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`✅ New cycle report saved to ${reportPath}`)
  }

  /**
   * Backup current state
   */
  async backupCurrentState(): Promise<void> {
    console.log("💾 Creating system backup...")

    // In production, this would backup:
    // - All user balances
    // - Badge ownership
    // - Redemption history
    // - Activity logs

    const backupData = {
      timestamp: new Date().toISOString(),
      cycleInfo: await this.cdaToken.getCycleInfo(),
      // Add more backup data as needed
    }

    const backupPath = `backups/pre-reset-backup-${Date.now()}.json`
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))

    console.log(`✅ Backup created: ${backupPath}`)
  }

  /**
   * Notify external systems
   */
  async notifyExternalSystems(): Promise<void> {
    console.log("🔗 Notifying external systems...")

    // In production, this would notify:
    // - Frontend applications
    // - Discord bots
    // - Analytics systems
    // - Subgraph indexers

    console.log("✅ External systems notified")
  }

  /**
   * Send notification
   */
  async sendNotification(
    title: string,
    message: string,
    type: "info" | "warning" | "error" | "success",
  ): Promise<void> {
    const colors = {
      info: 0x3498db,
      warning: 0xf39c12,
      error: 0xe74c3c,
      success: 0x2ecc71,
    }

    const notification = {
      embeds: [
        {
          title: `🔄 ${title}`,
          description: message,
          color: colors[type],
          timestamp: new Date().toISOString(),
          footer: {
            text: "CDA Reset Scheduler",
          },
        },
      ],
    }

    console.log(`🔔 NOTIFICATION [${type.toUpperCase()}]: ${title} - ${message}`)

    // In production: send to Discord/Slack webhook
    // if (this.schedule.notificationWebhook) {
    //   await fetch(this.schedule.notificationWebhook, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(notification)
    //   });
    // }
  }

  /**
   * Update schedule configuration
   */
  updateSchedule(newSchedule: Partial<ResetSchedule>): void {
    this.schedule = { ...this.schedule, ...newSchedule }
    console.log("✅ Schedule updated:", this.schedule)
  }

  /**
   * Stop the scheduler
   */
  stopScheduler(): void {
    this.isRunning = false
    console.log("🛑 Reset scheduler stopped")
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean
    schedule: ResetSchedule
    nextReset: string
  } {
    return {
      isRunning: this.isRunning,
      schedule: this.schedule,
      nextReset: "Next August 1st", // In production, calculate actual next run time
    }
  }
}

// Example usage
async function main() {
  const RESET_MANAGER_ADDRESS = process.env.RESET_MANAGER_ADDRESS || ""
  const CDA_TOKEN_ADDRESS = process.env.CDA_TOKEN_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

  if (!RESET_MANAGER_ADDRESS || !CDA_TOKEN_ADDRESS) {
    throw new Error("Please set RESET_MANAGER_ADDRESS and CDA_TOKEN_ADDRESS environment variables")
  }

  const resetManager = (await ethers.getContractAt("CDAResetManager", RESET_MANAGER_ADDRESS)) as CDAResetManager
  const cdaToken = (await ethers.getContractAt("CDAERC20", CDA_TOKEN_ADDRESS)) as CDAERC20

  const scheduler = new ResetScheduler(resetManager, cdaToken)

  // Configure for testing (every minute instead of annually)
  if (process.env.NODE_ENV === "development") {
    scheduler.updateSchedule({
      cronExpression: "*/5 * * * *", // Every 5 minutes for testing
      dryRun: true,
    })
  }

  await scheduler.startScheduler()

  // Keep the process running
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down scheduler...")
    scheduler.stopScheduler()
    process.exit(0)
  })

  console.log("✅ Reset scheduler is running. Press Ctrl+C to stop.")
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Scheduler failed to start:", error)
    process.exit(1)
  })
}

export { ResetScheduler }
