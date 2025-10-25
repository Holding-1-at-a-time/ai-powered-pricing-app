"use client"

import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"

export function SetupGuide() {
  const envVars = [
    {
      name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      description: "Clerk publishable key for authentication",
      link: "https://dashboard.clerk.com/last-active?path=api-keys",
      present: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    {
      name: "CLERK_SECRET_KEY",
      description: "Clerk secret key for server-side authentication",
      link: "https://dashboard.clerk.com/last-active?path=api-keys",
      present: false, // Server-side only, can't check from client
    },
    {
      name: "NEXT_PUBLIC_CONVEX_URL",
      description: "Convex deployment URL for database",
      link: "https://dashboard.convex.dev",
      present: !!process.env.NEXT_PUBLIC_CONVEX_URL,
    },
  ]

  const allConfigured = envVars.filter((v) => v.name.startsWith("NEXT_PUBLIC")).every((v) => v.present)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Setup Required</h1>
            <p className="text-muted-foreground">Configure environment variables to get started</p>
          </div>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">
            <p className="font-semibold">Missing Configuration</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add the required environment variables in the <strong>Vars</strong> section of the v0 sidebar.
            </p>
          </div>
        </Alert>

        <div className="space-y-4">
          {envVars.map((envVar) => (
            <div key={envVar.name} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{envVar.name}</code>
                    {envVar.present && <CheckCircle2 className="w-4 h-4 text-success" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{envVar.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="mt-2 bg-transparent">
                <a href={envVar.link} target="_blank" rel="noopener noreferrer">
                  Get from Dashboard
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Setup Steps:</h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Click the sidebar icon on the left side of the chat</li>
            <li>Select "Vars" from the menu</li>
            <li>Add each environment variable with its value</li>
            <li>The app will automatically restart</li>
          </ol>
        </div>

        {allConfigured && (
          <Alert className="mt-6 border-success bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div className="ml-2">
              <p className="font-semibold text-success">Configuration Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                All client-side environment variables are configured. Refresh the page to continue.
              </p>
            </div>
          </Alert>
        )}
      </Card>
    </div>
  )
}
