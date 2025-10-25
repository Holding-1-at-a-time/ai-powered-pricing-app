import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { internal } from "./_generated/api"

export const createBooking = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    serviceIds: v.array(v.id("services")),
    scheduledDate: v.number(),
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

    if (!user) {
      throw new Error("User not found")
    }

    // Verify vehicle belongs to user
    const vehicle = await ctx.db.get(args.vehicleId)
    if (!vehicle || vehicle.userId !== user._id) {
      throw new Error("Vehicle not found or unauthorized")
    }

    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      vehicleId: args.vehicleId,
      serviceIds: args.serviceIds,
      scheduledDate: args.scheduledDate,
      status: "pending",
      totalPrice: args.totalPrice,
      aiPricingFactors: args.aiPricingFactors,
      location: args.location,
      notes: args.notes,
    })

    // Record pricing history for AI learning
    const scheduledDateTime = new Date(args.scheduledDate)
    await ctx.db.insert("pricingHistory", {
      bookingId,
      serviceIds: args.serviceIds,
      vehicleType: vehicle.vehicleType,
      scheduledDate: args.scheduledDate,
      dayOfWeek: scheduledDateTime.getDay(),
      timeOfDay:
        scheduledDateTime.getHours() < 12 ? "morning" : scheduledDateTime.getHours() < 17 ? "afternoon" : "evening",
      basePrice: args.aiPricingFactors.basePrice,
      finalPrice: args.aiPricingFactors.finalPrice,
      demandLevel:
        args.aiPricingFactors.demandMultiplier > 1.1
          ? "high"
          : args.aiPricingFactors.demandMultiplier < 1
            ? "low"
            : "medium",
      wasAccepted: true,
    })

    await ctx.scheduler.runAfter(0, internal.workflows.bookingWorkflow.bookingWorkflow, {
      bookingId,
    })

    await ctx.db.insert("workflowStates", {
      workflowId: `booking-${bookingId}`,
      bookingId,
      currentStep: "confirmation",
      status: "running",
      startedAt: Date.now(),
    })

    return bookingId
  },
})

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) {
      return []
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()

    // Enrich with vehicle and service data
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const vehicle = await ctx.db.get(booking.vehicleId)
        const services = await Promise.all(booking.serviceIds.map((id) => ctx.db.get(id)))

        return {
          ...booking,
          vehicle,
          services: services.filter((s) => s !== null),
        }
      }),
    )

    return enrichedBookings
  },
})

export const getUserBookingCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect()

    return bookings.length
  },
})

export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const booking = await ctx.db.get(args.bookingId)
    if (!booking) {
      throw new Error("Booking not found")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || (booking.userId !== user._id && user.role !== "admin")) {
      throw new Error("Unauthorized")
    }

    const vehicle = await ctx.db.get(booking.vehicleId)
    const services = await Promise.all(booking.serviceIds.map((id) => ctx.db.get(id)))

    return {
      ...booking,
      vehicle,
      services: services.filter((s) => s !== null),
    }
  },
})

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
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

    await ctx.db.patch(args.bookingId, {
      status: args.status,
      ...(args.status === "completed" && { completedAt: Date.now() }),
    })

    return args.bookingId
  },
})

export const getAllBookings = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
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

    let bookingsQuery = ctx.db.query("bookings")

    if (args.status) {
      bookingsQuery = bookingsQuery.withIndex("by_status", (q) => q.eq("status", args.status))
    }

    const bookings = await bookingsQuery.order("desc").collect()

    // Enrich with user, vehicle, and service data
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingUser = await ctx.db.get(booking.userId)
        const vehicle = await ctx.db.get(booking.vehicleId)
        const services = await Promise.all(booking.serviceIds.map((id) => ctx.db.get(id)))

        return {
          ...booking,
          user: bookingUser,
          vehicle,
          services: services.filter((s) => s !== null),
        }
      }),
    )

    return enrichedBookings
  },
})
