import { api } from "../convex/_generated/api"

// This script seeds the pricing knowledge base with market data
// Run this once to initialize the AI pricing engine

const convex = new (await import("convex/browser")).ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

async function seedKnowledge() {
  console.log("Seeding pricing knowledge base...")

  try {
    const result = await convex.action(api.pricing.seedPricingKnowledge, {})
    console.log(`Successfully seeded ${result.count} knowledge items`)
  } catch (error) {
    console.error("Error seeding knowledge:", error)
  }
}

seedKnowledge()
