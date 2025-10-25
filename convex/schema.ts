import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // User management
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("customer"),
      v.literal("admin"),
      v.literal("detailer"),
      v.literal("tenant-owner"),
      v.literal("tenant-admin"),
    ),
    tenantId: v.optional(v.id("tenants")), // null for platform admins
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_tenant", ["tenantId"]),

  // Vehicle information
  vehicles: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")), // Added tenantId
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
    .index("by_type", ["vehicleType"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // Service catalog
  services: defineTable({
    tenantId: v.optional(v.id("tenants")), // Added tenantId for tenant-specific services
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
    conditionMultipliers: v.optional(
      v.object({
        excellent: v.number(),
        good: v.number(),
        fair: v.number(),
        poor: v.number(),
      }),
    ),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // Bookings
  bookings: defineTable({
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")), // Added tenantId
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
    sourceAssessmentId: v.optional(v.id("assessments")), // Link to assessment if converted
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_scheduled_date", ["scheduledDate"])
    .index("by_detailer", ["assignedDetailerId"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // Pricing history for AI learning
  pricingHistory: defineTable({
    bookingId: v.id("bookings"),
    tenantId: v.optional(v.id("tenants")), // Added tenantId
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
    .index("by_vehicle_type", ["vehicleType"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // AI pricing knowledge base (for RAG)
  pricingKnowledge: defineTable({
    tenantId: v.optional(v.id("tenants")), // Added tenantId for tenant-specific knowledge
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
    .index("by_tenant", ["tenantId"]) // Added tenant index
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["category", "tenantId"],
    }),

  // Reviews and ratings
  reviews: defineTable({
    bookingId: v.id("bookings"),
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")), // Added tenantId
    rating: v.number(),
    comment: v.optional(v.string()),
    serviceQuality: v.number(),
    valueForMoney: v.number(),
    timeliness: v.number(),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_user", ["userId"])
    .index("by_rating", ["rating"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // Business analytics
  analytics: defineTable({
    tenantId: v.optional(v.id("tenants")), // Added tenantId
    date: v.number(),
    metric: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_date", ["date"])
    .index("by_metric", ["metric"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // Workflow state tracking
  workflowStates: defineTable({
    workflowId: v.string(),
    bookingId: v.id("bookings"),
    tenantId: v.optional(v.id("tenants")), // Added tenantId
    currentStep: v.string(),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_workflow_id", ["workflowId"])
    .index("by_booking", ["bookingId"])
    .index("by_status", ["status"])
    .index("by_tenant", ["tenantId"]), // Added tenant index

  // Tenant management for multitenant SaaS architecture
  tenants: defineTable({
    businessName: v.string(),
    ownerClerkId: v.string(),
    ownerEmail: v.string(),
    slug: v.string(), // unique URL slug for the business
    qrCode: v.string(), // unique QR code identifier
    branding: v.object({
      logo: v.optional(v.string()),
      primaryColor: v.string(),
      secondaryColor: v.string(),
      accentColor: v.string(),
    }),
    contact: v.object({
      phone: v.string(),
      email: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
    settings: v.object({
      allowSelfAssessment: v.boolean(),
      requireVIN: v.boolean(),
      autoApproveBookings: v.boolean(),
      notificationEmail: v.string(),
    }),
    subscription: v.object({
      plan: v.union(v.literal("free"), v.literal("starter"), v.literal("professional"), v.literal("enterprise")),
      status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due")),
      currentPeriodEnd: v.number(),
    }),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerClerkId"])
    .index("by_slug", ["slug"])
    .index("by_qr_code", ["qrCode"])
    .index("by_active", ["isActive"]),

  // Clients table for self-assessment users (non-authenticated)
  clients: defineTable({
    tenantId: v.id("tenants"),
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    createdAt: v.number(),
    lastAssessmentAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_email", ["tenantId", "email"]),

  // Assessments table for client self-assessments
  assessments: defineTable({
    tenantId: v.id("tenants"),
    clientId: v.id("clients"),
    vehicleInfo: v.object({
      vin: v.optional(v.string()),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      color: v.string(),
      vehicleType: v.union(
        v.literal("sedan"),
        v.literal("suv"),
        v.literal("truck"),
        v.literal("van"),
        v.literal("coupe"),
        v.literal("luxury"),
      ),
    }),
    conditionAssessment: v.object({
      exterior: v.object({
        paint: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("poor")),
        scratches: v.boolean(),
        dents: v.boolean(),
        rust: v.boolean(),
        notes: v.optional(v.string()),
      }),
      interior: v.object({
        seats: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("poor")),
        carpet: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("poor")),
        dashboard: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("poor")),
        stains: v.boolean(),
        odors: v.boolean(),
        petHair: v.boolean(),
        notes: v.optional(v.string()),
      }),
      overall: v.object({
        mileage: v.number(),
        lastDetailDate: v.optional(v.string()),
        smokingVehicle: v.boolean(),
        notes: v.optional(v.string()),
      }),
    }),
    selectedServices: v.array(v.id("services")),
    estimatedPrice: v.number(),
    aiPricingFactors: v.object({
      basePrice: v.number(),
      vehicleMultiplier: v.number(),
      conditionMultiplier: v.number(), // based on assessment
      demandMultiplier: v.number(),
      finalPrice: v.number(),
    }),
    photos: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          url: v.string(),
          type: v.union(v.literal("exterior"), v.literal("interior"), v.literal("damage")),
        }),
      ),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("reviewed"),
      v.literal("approved"),
      v.literal("converted"),
    ),
    convertedToBookingId: v.optional(v.id("bookings")),
    createdAt: v.number(),
    submittedAt: v.optional(v.number()),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),
})
