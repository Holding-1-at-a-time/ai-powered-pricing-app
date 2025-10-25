import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // User management
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("customer"), v.literal("admin"), v.literal("detailer")),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Vehicle information
  vehicles: defineTable({
    userId: v.id("users"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.string(),
    licensePlate: v.optional(v.string()),
    vehicleType: v.union(
      v.literal("sedan"),
      v.literal("suv"),
      v.literal("truck"),
      v.literal("van"),
      v.literal("coupe"),
      v.literal("luxury"),
    ),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["vehicleType"]),

  // Service catalog
  services: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(v.literal("exterior"), v.literal("interior"), v.literal("full-detail"), v.literal("specialty")),
    basePrice: v.number(),
    duration: v.number(), // in minutes
    isActive: v.boolean(),
    vehicleTypeMultipliers: v.object({
      sedan: v.number(),
      suv: v.number(),
      truck: v.number(),
      van: v.number(),
      coupe: v.number(),
      luxury: v.number(),
    }),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Bookings
  bookings: defineTable({
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    serviceIds: v.array(v.id("services")),
    scheduledDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    totalPrice: v.number(),
    aiPricingFactors: v.object({
      basePrice: v.number(),
      vehicleMultiplier: v.number(),
      demandMultiplier: v.number(),
      seasonalMultiplier: v.number(),
      loyaltyDiscount: v.number(),
      finalPrice: v.number(),
    }),
    location: v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
    notes: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    assignedDetailerId: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_scheduled_date", ["scheduledDate"])
    .index("by_detailer", ["assignedDetailerId"]),

  // Pricing history for AI learning
  pricingHistory: defineTable({
    bookingId: v.id("bookings"),
    serviceIds: v.array(v.id("services")),
    vehicleType: v.string(),
    scheduledDate: v.number(),
    dayOfWeek: v.number(),
    timeOfDay: v.string(),
    basePrice: v.number(),
    finalPrice: v.number(),
    demandLevel: v.string(),
    weatherCondition: v.optional(v.string()),
    wasAccepted: v.boolean(),
    completionRating: v.optional(v.number()),
  })
    .index("by_booking", ["bookingId"])
    .index("by_date", ["scheduledDate"])
    .index("by_vehicle_type", ["vehicleType"]),

  // AI pricing knowledge base (for RAG)
  pricingKnowledge: defineTable({
    content: v.string(),
    category: v.union(
      v.literal("market-trends"),
      v.literal("seasonal-factors"),
      v.literal("competition"),
      v.literal("service-costs"),
      v.literal("customer-behavior"),
    ),
    metadata: v.object({
      source: v.string(),
      lastUpdated: v.number(),
      relevanceScore: v.number(),
    }),
    embedding: v.array(v.float64()),
  })
    .index("by_category", ["category"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["category"],
    }),

  // Reviews and ratings
  reviews: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    serviceQuality: v.number(),
    valueForMoney: v.number(),
    timeliness: v.number(),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_user", ["userId"])
    .index("by_rating", ["rating"]),

  // Business analytics
  analytics: defineTable({
    date: v.number(),
    metric: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_date", ["date"])
    .index("by_metric", ["metric"]),

  // Workflow state tracking
  workflowStates: defineTable({
    workflowId: v.string(),
    bookingId: v.id("bookings"),
    currentStep: v.string(),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_workflow_id", ["workflowId"])
    .index("by_booking", ["bookingId"])
    .index("by_status", ["status"]),
})
