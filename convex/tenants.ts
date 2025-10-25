import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create a new tenant (business onboarding)
export const createTenant = mutation({
  args: {
    businessName: v.string(),
    slug: v.string(),
    contact: v.object({
      phone: v.string(),
      email: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    }),
    branding: v.optional(
      v.object({
        primaryColor: v.string(),
        secondaryColor: v.string(),
        accentColor: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    // Check if slug is already taken
    const existingTenant = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()

    if (existingTenant) {
      throw new Error("Business slug already taken")
    }

    // Generate unique QR code identifier
    const qrCode = `${args.slug}-${Date.now()}`

    const tenantId = await ctx.db.insert("tenants", {
      businessName: args.businessName,
      ownerClerkId: identity.subject,
      ownerEmail: identity.email!,
      slug: args.slug,
      qrCode,
      branding: args.branding || {
        primaryColor: "#0066CC",
        secondaryColor: "#00CCCC",
        accentColor: "#FF6B35",
      },
      contact: args.contact,
      settings: {
        allowSelfAssessment: true,
        requireVIN: false,
        autoApproveBookings: false,
        notificationEmail: args.contact.email,
      },
      subscription: {
        plan: "free",
        status: "active",
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      isActive: true,
      createdAt: Date.now(),
    })

    // Update user role to tenant-owner
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (user) {
      await ctx.db.patch(user._id, {
        role: "tenant-owner",
        tenantId,
      })
    }

    return { tenantId, qrCode }
  },
})

// Get tenant by slug (for QR code landing page)
export const getTenantBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()

    return tenant
  },
})

// Get tenant by QR code
export const getTenantByQRCode = query({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique()

    return tenant
  },
})

// Get current user's tenant
export const getMyTenant = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user || !user.tenantId) {
      return null
    }

    const tenant = await ctx.db.get(user.tenantId)
    return tenant
  },
})

// Update tenant settings
export const updateTenantSettings = mutation({
  args: {
    tenantId: v.id("tenants"),
    settings: v.optional(
      v.object({
        allowSelfAssessment: v.optional(v.boolean()),
        requireVIN: v.optional(v.boolean()),
        autoApproveBookings: v.optional(v.boolean()),
        notificationEmail: v.optional(v.string()),
      }),
    ),
    branding: v.optional(
      v.object({
        logo: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        secondaryColor: v.optional(v.string()),
        accentColor: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    if (tenant.ownerClerkId !== identity.subject) {
      throw new Error("Unauthorized: Only tenant owner can update settings")
    }

    const updates: any = {}
    if (args.settings) {
      updates.settings = { ...tenant.settings, ...args.settings }
    }
    if (args.branding) {
      updates.branding = { ...tenant.branding, ...args.branding }
    }

    await ctx.db.patch(args.tenantId, updates)
    return args.tenantId
  },
})

// Get tenant statistics
export const getTenantStats = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const tenant = await ctx.db.get(args.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Get assessments count
    const assessments = await ctx.db
      .query("assessments")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    // Get bookings count
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    // Get clients count
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect()

    const completedBookings = bookings.filter((b) => b.status === "completed")
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    return {
      totalAssessments: assessments.length,
      totalBookings: bookings.length,
      totalClients: clients.length,
      completedBookings: completedBookings.length,
      totalRevenue,
      conversionRate: assessments.length > 0 ? (bookings.length / assessments.length) * 100 : 0,
    }
  },
})
