"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"
import { SetupGuide } from "@/components/setup-guide"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

let convex: ConvexReactClient | null = null

if (convexUrl) {
  convex = new ConvexReactClient(convexUrl)
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <SetupGuide />
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
