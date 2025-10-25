import { internalMutation } from "./_generated/server"
import { v } from "convex/values"

/**
 * Internal mutation to seed initial services
 * This should be called once during initial setup
 */
export const seedServices = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if services already exist
    const existingServices = await ctx.db.query("services").collect()

    if (existingServices.length > 0) {
      console.log("Services already seeded, skipping...")
      return { success: false, message: "Services already exist" }
    }

    const services = [
      {
        name: "Express Exterior Wash",
        description: "Quick exterior wash with hand dry. Perfect for regular maintenance.",
        category: "exterior" as const,
        basePrice: 49,
        duration: 30,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.3,
          truck: 1.4,
          van: 1.4,
          coupe: 1.0,
          luxury: 1.5,
        },
      },
      {
        name: "Premium Exterior Detail",
        description: "Complete exterior detail including wash, clay bar, polish, and wax protection.",
        category: "exterior" as const,
        basePrice: 149,
        duration: 120,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.4,
          truck: 1.5,
          van: 1.5,
          coupe: 1.0,
          luxury: 1.6,
        },
      },
      {
        name: "Interior Deep Clean",
        description: "Thorough interior cleaning including vacuum, shampoo, and leather conditioning.",
        category: "interior" as const,
        basePrice: 129,
        duration: 90,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.3,
          truck: 1.2,
          van: 1.5,
          coupe: 0.9,
          luxury: 1.4,
        },
      },
      {
        name: "Complete Interior Detail",
        description: "Premium interior service with steam cleaning, odor removal, and protection treatment.",
        category: "interior" as const,
        basePrice: 199,
        duration: 150,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.4,
          truck: 1.3,
          van: 1.6,
          coupe: 0.9,
          luxury: 1.5,
        },
      },
      {
        name: "Full Detail Package",
        description: "Complete interior and exterior detailing for a showroom finish.",
        category: "full-detail" as const,
        basePrice: 299,
        duration: 240,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.4,
          truck: 1.5,
          van: 1.6,
          coupe: 1.0,
          luxury: 1.7,
        },
      },
      {
        name: "Ultimate Detail Experience",
        description:
          "Our most comprehensive service including paint correction, ceramic coating prep, and premium protection.",
        category: "full-detail" as const,
        basePrice: 499,
        duration: 360,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.5,
          truck: 1.6,
          van: 1.7,
          coupe: 1.0,
          luxury: 1.8,
        },
      },
      {
        name: "Headlight Restoration",
        description: "Professional headlight restoration to improve visibility and appearance.",
        category: "specialty" as const,
        basePrice: 89,
        duration: 60,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.0,
          truck: 1.0,
          van: 1.0,
          coupe: 1.0,
          luxury: 1.2,
        },
      },
      {
        name: "Engine Bay Detailing",
        description: "Thorough engine compartment cleaning and dressing for a pristine look.",
        category: "specialty" as const,
        basePrice: 79,
        duration: 45,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.2,
          truck: 1.3,
          van: 1.2,
          coupe: 1.0,
          luxury: 1.3,
        },
      },
      {
        name: "Pet Hair Removal",
        description: "Specialized service to remove stubborn pet hair from all interior surfaces.",
        category: "specialty" as const,
        basePrice: 69,
        duration: 60,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.3,
          truck: 1.2,
          van: 1.4,
          coupe: 0.9,
          luxury: 1.2,
        },
      },
      {
        name: "Odor Elimination Treatment",
        description: "Professional ozone treatment to eliminate smoke, pet, and other stubborn odors.",
        category: "specialty" as const,
        basePrice: 99,
        duration: 90,
        isActive: true,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.2,
          truck: 1.2,
          van: 1.3,
          coupe: 1.0,
          luxury: 1.2,
        },
      },
    ]

    // Insert all services
    for (const service of services) {
      await ctx.db.insert("services", service)
    }

    return {
      success: true,
      message: `Successfully seeded ${services.length} services`,
      count: services.length,
    }
  },
})

/**
 * Helper mutation to create a test admin user
 * Only use this for development/testing
 */
export const createTestAdmin = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique()

    if (existingUser) {
      // Update to admin if not already
      if (existingUser.role !== "admin") {
        await ctx.db.patch(existingUser._id, { role: "admin" })
        return { success: true, message: "User updated to admin", userId: existingUser._id }
      }
      return { success: false, message: "User already exists as admin", userId: existingUser._id }
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "admin",
      createdAt: Date.now(),
    })

    return { success: true, message: "Admin user created", userId }
  },
})
