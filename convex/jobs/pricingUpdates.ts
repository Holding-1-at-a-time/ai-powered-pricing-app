import { cronJobs } from "convex/server"
import { internal } from "../_generated/api"

const crons = cronJobs()

// Update pricing knowledge base daily
crons.daily(
  "update-pricing-knowledge",
  { hourUTC: 2, minuteUTC: 0 }, // 2 AM UTC
  internal.jobs.pricingUpdates.updatePricingKnowledge,
)

// Calculate daily analytics
crons.daily(
  "calculate-daily-analytics",
  { hourUTC: 3, minuteUTC: 0 }, // 3 AM UTC
  internal.jobs.pricingUpdates.calculateDailyAnalytics,
)

// Clean up old pricing history (keep last 90 days)
crons.weekly(
  "cleanup-old-data",
  { hourUTC: 4, minuteUTC: 0, dayOfWeek: "monday" },
  internal.jobs.pricingUpdates.cleanupOldData,
)

export default crons

export const updatePricingKnowledge = internal.mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[Cron] Updating pricing knowledge base...")

    // Get recent booking data
    const recentBookings = await ctx.db
      .query("pricingHistory")
      .withIndex("by_date", (q) => q.gte("scheduledDate", Date.now() - 30 * 24 * 60 * 60 * 1000))
      .collect()

    // Calculate acceptance rates by time slot
    const timeSlotData = recentBookings.reduce(
      (acc, booking) => {
        const slot = booking.timeOfDay
        if (!acc[slot]) {
          acc[slot] = { total: 0, accepted: 0 }
        }
        acc[slot].total++
        if (booking.wasAccepted) {
          acc[slot].accepted++
        }
        return acc
      },
      {} as Record<string, { total: number; accepted: number }>,
    )

    console.log("[Cron] Time slot acceptance rates:", timeSlotData)

    // In production, this would update the pricing knowledge base with new insights
    // and retrain the pricing model based on recent data

    return { success: true, bookingsAnalyzed: recentBookings.length }
  },
})

export const calculateDailyAnalytics = internal.mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[Cron] Calculating daily analytics...")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // Get today's bookings
    const todayBookings = await ctx.db
      .query("bookings")
      .withIndex("by_scheduled_date", (q) => q.gte("scheduledDate", todayTimestamp))
      .collect()

    const completedToday = todayBookings.filter((b) => b.status === "completed")
    const totalRevenue = completedToday.reduce((sum, b) => sum + b.totalPrice, 0)

    // Store analytics
    await ctx.db.insert("analytics", {
      date: todayTimestamp,
      metric: "daily_bookings",
      value: todayBookings.length,
    })

    await ctx.db.insert("analytics", {
      date: todayTimestamp,
      metric: "daily_revenue",
      value: totalRevenue,
    })

    await ctx.db.insert("analytics", {
      date: todayTimestamp,
      metric: "daily_completed",
      value: completedToday.length,
    })

    console.log(`[Cron] Analytics calculated: ${todayBookings.length} bookings, $${totalRevenue} revenue`)

    return { success: true, bookings: todayBookings.length, revenue: totalRevenue }
  },
})

export const cleanupOldData = internal.mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[Cron] Cleaning up old data...")

    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000

    // Get old pricing history records
    const oldRecords = await ctx.db
      .query("pricingHistory")
      .withIndex("by_date", (q) => q.lt("scheduledDate", ninetyDaysAgo))
      .collect()

    // Delete old records
    for (const record of oldRecords) {
      await ctx.db.delete(record._id)
    }

    console.log(`[Cron] Cleaned up ${oldRecords.length} old pricing history records`)

    return { success: true, deletedRecords: oldRecords.length }
  },
})
