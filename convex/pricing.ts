import { v } from "convex/values"
import { action, internalAction, mutation, query } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { embed } from "@convex-dev/rag"

// Initialize pricing knowledge base with market data
export const seedPricingKnowledge = internalAction({
  args: {},
  handler: async (ctx) => {
    const knowledgeItems = [
      {
        content:
          "Peak demand periods for auto detailing are typically Friday through Sunday, especially before holidays and special events. Prices can increase by 15-25% during these high-demand periods.",
        category: "market-trends" as const,
        source: "Industry Analysis 2024",
      },
      {
        content:
          "Seasonal factors significantly impact pricing. Spring and summer see 30-40% higher demand due to better weather and vacation season. Winter detailing often includes salt removal and requires 20% more time.",
        category: "seasonal-factors" as const,
        source: "Seasonal Demand Study",
      },
      {
        content:
          "Larger vehicles (SUVs, trucks, vans) require 40-60% more time and materials than sedans. Luxury vehicles command 25-35% premium due to specialized care requirements and higher customer expectations.",
        category: "service-costs" as const,
        source: "Service Cost Analysis",
      },
      {
        content:
          "Customer loyalty programs show that repeat customers are willing to pay 10-15% more for guaranteed quality and convenience. First-time customers are more price-sensitive and respond well to introductory discounts.",
        category: "customer-behavior" as const,
        source: "Customer Retention Study",
      },
      {
        content:
          "Local market competition analysis shows average exterior detail pricing ranges from $80-$150, interior from $120-$200, and full detail from $180-$350 depending on vehicle size and location.",
        category: "competition" as const,
        source: "Competitive Market Analysis",
      },
      {
        content:
          "Time-of-day pricing optimization: Morning slots (8am-11am) have lower demand and can be discounted 10-15%. Afternoon slots (2pm-5pm) are most popular and can command premium pricing.",
        category: "market-trends" as const,
        source: "Booking Pattern Analysis",
      },
      {
        content:
          "Weather conditions impact demand significantly. Rainy days see 40% drop in bookings, while sunny days after rain see 25% increase. Dynamic pricing should adjust accordingly.",
        category: "seasonal-factors" as const,
        source: "Weather Impact Study",
      },
      {
        content:
          "Service bundling increases average transaction value by 35%. Customers booking multiple services are less price-sensitive and value convenience over individual service pricing.",
        category: "customer-behavior" as const,
        source: "Service Bundle Analysis",
      },
    ]

    for (const item of knowledgeItems) {
      const embedding = await embed(ctx, item.content)

      await ctx.runMutation(internal.pricing.insertKnowledge, {
        content: item.content,
        category: item.category,
        source: item.source,
        embedding,
      })
    }

    return { success: true, count: knowledgeItems.length }
  },
})

export const insertKnowledge = mutation({
  args: {
    content: v.string(),
    category: v.union(
      v.literal("market-trends"),
      v.literal("seasonal-factors"),
      v.literal("competition"),
      v.literal("service-costs"),
      v.literal("customer-behavior"),
    ),
    source: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pricingKnowledge", {
      content: args.content,
      category: args.category,
      metadata: {
        source: args.source,
        lastUpdated: Date.now(),
        relevanceScore: 1.0,
      },
      embedding: args.embedding,
    })
  },
})

// Calculate AI-powered dynamic pricing
export const calculateDynamicPrice = action({
  args: {
    serviceIds: v.array(v.id("services")),
    vehicleType: v.union(
      v.literal("sedan"),
      v.literal("suv"),
      v.literal("truck"),
      v.literal("van"),
      v.literal("coupe"),
      v.literal("luxury"),
    ),
    scheduledDate: v.number(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get services
    const services = await Promise.all(
      args.serviceIds.map((id) => ctx.runQuery(api.services.getServiceById, { serviceId: id })),
    )

    // Calculate base price
    let basePrice = 0
    for (const service of services) {
      if (service) {
        const multiplier = service.vehicleTypeMultipliers[args.vehicleType]
        basePrice += service.basePrice * multiplier
      }
    }

    // Get contextual information for AI pricing
    const scheduledDateTime = new Date(args.scheduledDate)
    const dayOfWeek = scheduledDateTime.getDay()
    const hour = scheduledDateTime.getHours()
    const month = scheduledDateTime.getMonth()

    // Build context query for RAG
    const contextQuery = `Pricing factors for ${args.vehicleType} vehicle, scheduled for ${dayOfWeek === 0 || dayOfWeek === 6 ? "weekend" : "weekday"}, ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"} slot, in ${month >= 3 && month <= 8 ? "peak season" : "off-season"}.`

    // Get relevant pricing knowledge using RAG
    const embedding = await embed(ctx, contextQuery)
    const relevantKnowledge = await ctx.vectorSearch("pricingKnowledge", "by_embedding", {
      vector: embedding,
      limit: 5,
    })

    // Calculate demand multiplier (weekend = higher, weekday = lower)
    const demandMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.15 : dayOfWeek === 5 ? 1.1 : 0.95

    // Calculate seasonal multiplier (spring/summer = higher)
    const seasonalMultiplier = month >= 3 && month <= 8 ? 1.2 : 0.9

    // Calculate time-of-day multiplier
    const timeMultiplier = hour >= 14 && hour <= 17 ? 1.1 : hour >= 8 && hour <= 11 ? 0.9 : 1.0

    // Check for loyalty discount
    let loyaltyDiscount = 0
    if (args.userId) {
      const userBookings = await ctx.runQuery(api.bookings.getUserBookingCount, { userId: args.userId })
      if (userBookings >= 5) {
        loyaltyDiscount = 0.1 // 10% discount for loyal customers
      } else if (userBookings >= 3) {
        loyaltyDiscount = 0.05 // 5% discount
      }
    }

    // Calculate final price
    const priceBeforeDiscount = basePrice * demandMultiplier * seasonalMultiplier * timeMultiplier
    const finalPrice = Math.round(priceBeforeDiscount * (1 - loyaltyDiscount))

    return {
      basePrice: Math.round(basePrice),
      vehicleMultiplier: services[0]?.vehicleTypeMultipliers[args.vehicleType] || 1,
      demandMultiplier: Math.round(demandMultiplier * 100) / 100,
      seasonalMultiplier: Math.round(seasonalMultiplier * 100) / 100,
      timeMultiplier: Math.round(timeMultiplier * 100) / 100,
      loyaltyDiscount: Math.round(loyaltyDiscount * 100) / 100,
      finalPrice,
      priceBreakdown: {
        base: Math.round(basePrice),
        afterDemand: Math.round(basePrice * demandMultiplier),
        afterSeasonal: Math.round(basePrice * demandMultiplier * seasonalMultiplier),
        afterTime: Math.round(priceBeforeDiscount),
        final: finalPrice,
      },
      aiInsights: relevantKnowledge.map((k) => k.content).slice(0, 3),
    }
  },
})

// Get pricing insights for admin dashboard
export const getPricingAnalytics = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    const pricingHistory = await ctx.db
      .query("pricingHistory")
      .withIndex("by_date", (q) => q.gte("scheduledDate", args.startDate).lte("scheduledDate", args.endDate))
      .collect()

    // Calculate analytics
    const totalBookings = pricingHistory.length
    const acceptedBookings = pricingHistory.filter((p) => p.wasAccepted).length
    const acceptanceRate = totalBookings > 0 ? (acceptedBookings / totalBookings) * 100 : 0

    const avgBasePrice = pricingHistory.reduce((sum, p) => sum + p.basePrice, 0) / (totalBookings || 1)
    const avgFinalPrice = pricingHistory.reduce((sum, p) => sum + p.finalPrice, 0) / (totalBookings || 1)

    const priceByVehicleType = pricingHistory.reduce(
      (acc, p) => {
        if (!acc[p.vehicleType]) {
          acc[p.vehicleType] = { count: 0, totalPrice: 0 }
        }
        acc[p.vehicleType].count++
        acc[p.vehicleType].totalPrice += p.finalPrice
        return acc
      },
      {} as Record<string, { count: number; totalPrice: number }>,
    )

    return {
      totalBookings,
      acceptedBookings,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      avgBasePrice: Math.round(avgBasePrice),
      avgFinalPrice: Math.round(avgFinalPrice),
      priceByVehicleType: Object.entries(priceByVehicleType).map(([type, data]) => ({
        vehicleType: type,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
      })),
    }
  },
})
