import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create a new assessment
export const createAssessment = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const assessmentId = await ctx.db.insert("assessments", {
      tenantId: args.tenantId,
      clientId: args.clientId,
      vehicleInfo: args.vehicleInfo,
      conditionAssessment: {
        exterior: {
          paint: "good",
          scratches: false,
          dents: false,
          rust: false,
        },
        interior: {
          seats: "good",
          carpet: "good",
          dashboard: "good",
          stains: false,
          odors: false,
          petHair: false,
        },
        overall: {
          mileage: 0,
          smokingVehicle: false,
        },
      },
      selectedServices: [],
      estimatedPrice: 0,
      aiPricingFactors: {
        basePrice: 0,
        vehicleMultiplier: 1,
        conditionMultiplier: 1,
        demandMultiplier: 1,
        finalPrice: 0,
      },
      status: "draft",
      createdAt: Date.now(),
    })

    return assessmentId
  },
})

// Update assessment condition
export const updateAssessmentCondition = mutation({
  args: {
    assessmentId: v.id("assessments"),
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assessmentId, {
      conditionAssessment: args.conditionAssessment,
    })

    return args.assessmentId
  },
})

// Update assessment services and calculate pricing
export const updateAssessmentServices = mutation({
  args: {
    assessmentId: v.id("assessments"),
    serviceIds: v.array(v.id("services")),
  },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId)
    if (!assessment) {
      throw new Error("Assessment not found")
    }

    // Get services
    const services = await Promise.all(args.serviceIds.map((id) => ctx.db.get(id)))
    const validServices = services.filter((s) => s !== null)

    // Calculate base price
    let basePrice = 0
    const vehicleType = assessment.vehicleInfo.vehicleType

    for (const service of validServices) {
      if (service) {
        const multiplier = service.vehicleTypeMultipliers[vehicleType] || 1
        basePrice += service.basePrice * multiplier
      }
    }

    // Calculate condition multiplier based on assessment
    const conditionMultiplier = calculateConditionMultiplier(assessment.conditionAssessment)

    // Calculate demand multiplier (simplified for now)
    const demandMultiplier = 1.0

    const finalPrice = basePrice * conditionMultiplier * demandMultiplier

    await ctx.db.patch(args.assessmentId, {
      selectedServices: args.serviceIds,
      estimatedPrice: finalPrice,
      aiPricingFactors: {
        basePrice,
        vehicleMultiplier: 1,
        conditionMultiplier,
        demandMultiplier,
        finalPrice,
      },
    })

    return { estimatedPrice: finalPrice }
  },
})

// Submit assessment
export const submitAssessment = mutation({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId)
    if (!assessment) {
      throw new Error("Assessment not found")
    }

    await ctx.db.patch(args.assessmentId, {
      status: "submitted",
      submittedAt: Date.now(),
    })

    // Update client's last assessment date
    await ctx.db.patch(assessment.clientId, {
      lastAssessmentAt: Date.now(),
    })

    return args.assessmentId
  },
})

// Get assessment by ID
export const getAssessmentById = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId)
    if (!assessment) {
      return null
    }

    const client = await ctx.db.get(assessment.clientId)
    const services = await Promise.all(assessment.selectedServices.map((id) => ctx.db.get(id)))

    return {
      ...assessment,
      client,
      services: services.filter((s) => s !== null),
    }
  },
})

// Get all assessments for a tenant
export const getTenantAssessments = query({
  args: {
    tenantId: v.id("tenants"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("reviewed"),
        v.literal("approved"),
        v.literal("converted"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const query = ctx.db.query("assessments").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    const assessments = await query.order("desc").collect()

    const filtered = args.status ? assessments.filter((a) => a.status === args.status) : assessments

    // Enrich with client and service data
    const enriched = await Promise.all(
      filtered.map(async (assessment) => {
        const client = await ctx.db.get(assessment.clientId)
        const services = await Promise.all(assessment.selectedServices.map((id) => ctx.db.get(id)))

        return {
          ...assessment,
          client,
          services: services.filter((s) => s !== null),
        }
      }),
    )

    return enriched
  },
})

// Helper function to calculate condition multiplier
function calculateConditionMultiplier(condition: any): number {
  const conditionScores = {
    excellent: 0.9,
    good: 1.0,
    fair: 1.2,
    poor: 1.5,
  }

  // Average exterior condition
  const exteriorScore = conditionScores[condition.exterior.paint]
  const exteriorPenalty =
    (condition.exterior.scratches ? 0.1 : 0) +
    (condition.exterior.dents ? 0.1 : 0) +
    (condition.exterior.rust ? 0.15 : 0)

  // Average interior condition
  const interiorScores = [
    conditionScores[condition.interior.seats],
    conditionScores[condition.interior.carpet],
    conditionScores[condition.interior.dashboard],
  ]
  const interiorScore = interiorScores.reduce((a, b) => a + b, 0) / interiorScores.length
  const interiorPenalty =
    (condition.interior.stains ? 0.1 : 0) +
    (condition.interior.odors ? 0.15 : 0) +
    (condition.interior.petHair ? 0.1 : 0)

  // Overall penalty
  const overallPenalty = condition.overall.smokingVehicle ? 0.1 : 0

  const totalMultiplier = (exteriorScore + interiorScore) / 2 + exteriorPenalty + interiorPenalty + overallPenalty

  return Math.max(0.9, Math.min(2.0, totalMultiplier))
}
