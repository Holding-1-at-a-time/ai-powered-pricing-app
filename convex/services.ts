import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getAllServices = query({
  args: {},
  handler: async (ctx) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()

    return services
  },
})

export const getServicesByCategory = query({
  args: {
    category: v.union(v.literal("exterior"), v.literal("interior"), v.literal("full-detail"), v.literal("specialty")),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    return services
  },
})

export const getServiceById = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId)
    return service
  },
})

// Admin functions
export const createService = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.union(v.literal("exterior"), v.literal("interior"), v.literal("full-detail"), v.literal("specialty")),
    basePrice: v.number(),
    duration: v.number(),
    vehicleTypeMultipliers: v.object({
      sedan: v.number(),
      suv: v.number(),
      truck: v.number(),
      van: v.number(),
      coupe: v.number(),
      luxury: v.number(),
    }),
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

    const serviceId = await ctx.db.insert("services", {
      ...args,
      isActive: true,
    })

    return serviceId
  },
})

export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    basePrice: v.optional(v.number()),
    duration: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
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

    const { serviceId, ...updates } = args
    await ctx.db.patch(serviceId, updates)

    return serviceId
  },
})
