import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Update pricing knowledge base daily at 2 AM UTC
crons.daily(
  "update-pricing-knowledge",
  { hourUTC: 2, minuteUTC: 0 },
  internal.jobs.pricingUpdates.updatePricingKnowledge,
)

// Calculate daily analytics at 3 AM UTC
crons.daily(
  "calculate-daily-analytics",
  { hourUTC: 3, minuteUTC: 0 },
  internal.jobs.pricingUpdates.calculateDailyAnalytics,
)

// Clean up old data weekly on Monday at 4 AM UTC
crons.weekly(
  "cleanup-old-data",
  { hourUTC: 4, minuteUTC: 0, dayOfWeek: "monday" },
  internal.jobs.pricingUpdates.cleanupOldData,
)

export default crons
