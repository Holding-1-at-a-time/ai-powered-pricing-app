import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Create or get client (for self-assessment flow)
export const createOrGetClient = mutation({
  args: {
    tenantId: v.id("tenants"),
    email: v.string(),
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if client already exists
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("tenantId", args.tenantId).eq("email", args.email))
      .unique()

    if (existingClient) {
      return existingClient._id
    }

    // Create new client
    const clientId = await ctx.db.insert("clients", {
      tenantId: args.tenantId,
      email: args.email,
      name: args.name,
      phone: args.phone,
      createdAt: Date.now(),
    })

    return clientId
  },
})

// Get client by ID
export const getClientById = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId)
    return client
  },
})

// Get all clients for a tenant
export const getTenantClients = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .order("desc")
      .collect()

    return clients
  },
})
