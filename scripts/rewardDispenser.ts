import { ethers } from "hardhat"
import type { CDAERC20, CDABadgeNFT } from "../typechain-types"
import fs from "fs"
import csv from "csv-parser"

interface EventAttendee {
  address: string
  name: string
  role: string
  activityType: string
  rewardAmount: number
}

interface RewardConfig {
  eventAttendance: number
  volunteerWork: number
  presentation: number
  projectCompletion: number
  hackathonWin: number
}

class RewardDispenser {
  private cdaToken: CDAERC20
  private badgeNFT: CDABadgeNFT
  private rewardConfig: RewardConfig

  constructor(cdaToken: CDAERC20, badgeNFT: CDABadgeNFT) {
    this.cdaToken = cdaToken
    this.badgeNFT = badgeNFT
    this.rewardConfig = {
      eventAttendance: 50,
      volunteerWork: 100,
      presentation: 200,
      projectCompletion: 500,
      hackathonWin: 1000,
    }
  }

  /**
   * Process event attendance from CSV file
   */
  async processEventAttendance(csvFilePath: string): Promise<void> {
    console.log(`📊 Processing event attendance from ${csvFilePath}...`)

    const attendees: EventAttendee[] = []

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
          attendees.push({
            address: row.address,
            name: row.name,
            role: row.role || "attendee",
            activityType: "event",
            rewardAmount: this.rewardConfig.eventAttendance,
          })
        })
        .on("end", async () => {
          try {
            await this.distributeRewards(attendees)
            console.log(`✅ Processed ${attendees.length} event attendees`)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
        .on("error", reject)
    })
  }

  /**
   * Distribute rewards to multiple users
   */
  async distributeRewards(recipients: EventAttendee[]): Promise<void> {
    console.log(`💰 Distributing rewards to ${recipients.length} recipients...`)

    // Group by activity type for batch processing
    const groupedBy = recipients.reduce(
      (acc, recipient) => {
        if (!acc[recipient.activityType]) {
          acc[recipient.activityType] = []
        }
        acc[recipient.activityType].push(recipient)
        return acc
      },
      {} as Record<string, EventAttendee[]>,
    )

    for (const [activityType, group] of Object.entries(groupedBy)) {
      await this.batchDistributeByActivity(activityType, group)
    }
  }

  /**
   * Batch distribute rewards for specific activity type
   */
  async batchDistributeByActivity(activityType: string, recipients: EventAttendee[]): Promise<void> {
    const addresses = recipients.map((r) => r.address)
    const amounts = recipients.map((r) => ethers.utils.parseEther(r.rewardAmount.toString()))
    const reason = `${activityType} participation - ${new Date().toISOString()}`

    try {
      // Distribute CDA tokens
      const tx = await this.cdaToken.batchDistributeRewards(addresses, amounts, reason, this.getCategory(activityType))
      await tx.wait()
      console.log(`✅ CDA tokens distributed for ${activityType}`)

      // Record activity for badge progression
      const counts = recipients.map(() => 1) // Each person gets 1 count for the activity
      await this.badgeNFT.batchRecordActivity(addresses, activityType, counts)
      console.log(`✅ Activity recorded for badge progression`)
    } catch (error) {
      console.error(`❌ Failed to distribute rewards for ${activityType}:`, error)
      throw error
    }
  }

  /**
   * Manual reward distribution for special cases
   */
  async distributeSpecialReward(
    address: string,
    amount: number,
    reason: string,
    category = "milestone",
  ): Promise<void> {
    console.log(`🎯 Distributing special reward: ${amount} CDA to ${address}`)

    try {
      const tx = await this.cdaToken.distributeReward(
        address,
        ethers.utils.parseEther(amount.toString()),
        reason,
        category,
      )
      await tx.wait()
      console.log(`✅ Special reward distributed successfully`)
    } catch (error) {
      console.error(`❌ Failed to distribute special reward:`, error)
      throw error
    }
  }

  /**
   * Distribute hackathon rewards
   */
  async distributeHackathonRewards(
    winners: {
      address: string
      name: string
      place: number
    }[],
  ): Promise<void> {
    console.log(`🏆 Distributing hackathon rewards to ${winners.length} winners...`)

    const rewardAmounts = {
      1: 1000, // 1st place
      2: 750, // 2nd place
      3: 500, // 3rd place
    }

    for (const winner of winners) {
      const amount = rewardAmounts[winner.place as keyof typeof rewardAmounts] || 250
      await this.distributeSpecialReward(
        winner.address,
        amount,
        `Hackathon ${winner.place}${winner.place === 1 ? "st" : winner.place === 2 ? "nd" : "rd"} place winner`,
        "milestone",
      )

      // Record project completion for badge
      await this.badgeNFT.recordActivity(winner.address, "project", 1)
    }

    console.log(`✅ All hackathon rewards distributed`)
  }

  /**
   * Monthly node runner rewards
   */
  async distributeNodeRunnerRewards(
    nodeRunners: {
      address: string
      uptime: number
      name: string
    }[],
  ): Promise<void> {
    console.log(`🖥️ Distributing node runner rewards...`)

    const totalNodeAllocation = await this.cdaToken.getRemainingAllocation("node")
    const totalUptimeScore = nodeRunners.reduce((sum, runner) => sum + runner.uptime, 0)

    for (const runner of nodeRunners) {
      if (runner.uptime < 0.8) {
        // Minimum 80% uptime required
        console.log(`⚠️ Skipping ${runner.name} - uptime too low: ${runner.uptime * 100}%`)
        continue
      }

      const rewardShare = runner.uptime / totalUptimeScore
      const rewardAmount = totalNodeAllocation.mul(Math.floor(rewardShare * 10000)).div(10000)

      if (rewardAmount.gt(0)) {
        await this.cdaToken.distributeReward(
          runner.address,
          rewardAmount,
          `Node runner reward - ${(runner.uptime * 100).toFixed(1)}% uptime`,
          "node",
        )
        console.log(`✅ Rewarded ${runner.name}: ${ethers.utils.formatEther(rewardAmount)} CDA`)
      }
    }
  }

  /**
   * Get allocation category for activity type
   */
  private getCategory(activityType: string): string {
    const categoryMap: Record<string, string> = {
      event: "activity",
      volunteer: "activity",
      presentation: "milestone",
      project: "milestone",
      hackathon: "milestone",
    }
    return categoryMap[activityType] || "activity"
  }

  /**
   * Generate reward report
   */
  async generateRewardReport(): Promise<void> {
    console.log(`📊 Generating reward distribution report...`)

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
      timestamp: new Date().toISOString(),
      cycle: cycleInfo.cycle.toString(),
      daysUntilReset: cycleInfo.daysUntilReset.toString(),
      remainingAllocations: {
        activity: ethers.utils.formatEther(allocations.activity),
        milestone: ethers.utils.formatEther(allocations.milestone),
        swag: ethers.utils.formatEther(allocations.swag),
        nft: ethers.utils.formatEther(allocations.nft),
        node: ethers.utils.formatEther(allocations.node),
        admin: ethers.utils.formatEther(allocations.admin),
      },
      utilizationRates: {
        activity:
          (((60000 - Number.parseFloat(ethers.utils.formatEther(allocations.activity))) / 60000) * 100).toFixed(2) +
          "%",
        milestone:
          (((15000 - Number.parseFloat(ethers.utils.formatEther(allocations.milestone))) / 15000) * 100).toFixed(2) +
          "%",
        swag:
          (((10000 - Number.parseFloat(ethers.utils.formatEther(allocations.swag))) / 10000) * 100).toFixed(2) + "%",
        nft: (((7500 - Number.parseFloat(ethers.utils.formatEther(allocations.nft))) / 7500) * 100).toFixed(2) + "%",
        node: (((5000 - Number.parseFloat(ethers.utils.formatEther(allocations.node))) / 5000) * 100).toFixed(2) + "%",
      },
    }

    fs.writeFileSync(`reports/reward-report-${Date.now()}.json`, JSON.stringify(report, null, 2))

    console.log(`✅ Report generated and saved to reports/`)
    console.log(`📈 Current cycle: ${report.cycle}`)
    console.log(`⏰ Days until reset: ${report.daysUntilReset}`)
    console.log(`💰 Activity allocation used: ${report.utilizationRates.activity}`)
    console.log(`🏆 Milestone allocation used: ${report.utilizationRates.milestone}`)
  }
}

// Example usage
async function main() {
  const [deployer] = await ethers.getSigners()

  // Replace with actual deployed contract addresses
  const CDA_TOKEN_ADDRESS = process.env.CDA_TOKEN_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  const BADGE_NFT_ADDRESS = process.env.BADGE_NFT_ADDRESS || ""

  if (!CDA_TOKEN_ADDRESS || !BADGE_NFT_ADDRESS) {
    throw new Error("Please set CDA_TOKEN_ADDRESS and BADGE_NFT_ADDRESS environment variables")
  }

  const cdaToken = (await ethers.getContractAt("CDAERC20", CDA_TOKEN_ADDRESS)) as CDAERC20
  const badgeNFT = (await ethers.getContractAt("CDABadgeNFT", BADGE_NFT_ADDRESS)) as CDABadgeNFT

  const dispenser = new RewardDispenser(cdaToken, badgeNFT)

  // Example: Process event attendance
  // await dispenser.processEventAttendance("data/event-attendance.csv");

  // Example: Distribute hackathon rewards
  // await dispenser.distributeHackathonRewards([
  //   { address: "0x...", name: "Team Alpha", place: 1 },
  //   { address: "0x...", name: "Team Beta", place: 2 },
  //   { address: "0x...", name: "Team Gamma", place: 3 },
  // ]);

  // Generate report
  await dispenser.generateRewardReport()
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Reward distribution failed:", error)
      process.exit(1)
    })
}

export { RewardDispenser }
