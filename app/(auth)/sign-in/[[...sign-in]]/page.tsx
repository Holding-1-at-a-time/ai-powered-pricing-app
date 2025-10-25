import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!clerkPublishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md p-8 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-display font-bold mb-4">Configuration Required</h2>
          <p className="text-muted-foreground mb-4">
            Please add <code className="bg-muted px-2 py-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to your
            environment variables.
          </p>
          <p className="text-sm text-muted-foreground">
            Get your key from the{" "}
            <a
              href="https://dashboard.clerk.com/last-active?path=api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Clerk Dashboard
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your AutoDetail Pro account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card shadow-lg border border-border",
            },
          }}
        />
      </div>
    </div>
  )
}
