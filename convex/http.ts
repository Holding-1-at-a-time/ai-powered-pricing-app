import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"
import { api } from "./_generated/api"

const http = httpRouter()

// Clerk webhook handler
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json()

    // Handle user.created event
    if (payload.type === "user.created") {
      const { id, email_addresses, first_name, last_name, phone_numbers } = payload.data

      await ctx.runMutation(api.users.createUser, {
        clerkId: id,
        email: email_addresses[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        phone: phone_numbers[0]?.phone_number,
        role: "customer",
      })
    }

    return new Response(null, { status: 200 })
  }),
})

export default http
