import { defineWorkflow } from "@convex-dev/workflow"
import { v } from "convex/values"
import { internal } from "../_generated/api"

export const bookingWorkflow = defineWorkflow({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (step, args) => {
    // Step 1: Send booking confirmation
    await step.runAction(internal.notifications.sendBookingConfirmation, {
      bookingId: args.bookingId,
    })

    // Step 2: Wait for 24 hours before scheduled date to send reminder
    const booking = await step.runQuery(internal.workflows.bookingWorkflow.getBookingDetails, {
      bookingId: args.bookingId,
    })

    if (booking) {
      const reminderTime = booking.scheduledDate - 24 * 60 * 60 * 1000 // 24 hours before
      const now = Date.now()

      if (reminderTime > now) {
        await step.sleep("reminder-wait", reminderTime - now)

        // Send reminder notification
        await step.runAction(internal.notifications.sendBookingReminder, {
          bookingId: args.bookingId,
        })
      }

      // Step 3: Wait until scheduled time
      if (booking.scheduledDate > Date.now()) {
        await step.sleep("scheduled-wait", booking.scheduledDate - Date.now())
      }

      // Step 4: Check if booking is still confirmed
      const currentBooking = await step.runQuery(internal.workflows.bookingWorkflow.getBookingDetails, {
        bookingId: args.bookingId,
      })

      if (currentBooking?.status === "confirmed") {
        // Auto-update to in-progress
        await step.runMutation(internal.workflows.bookingWorkflow.updateBookingStatus, {
          bookingId: args.bookingId,
          status: "in-progress",
        })
      }

      // Step 5: Wait for service duration + buffer
      const serviceDuration = (booking.services?.reduce((sum, s) => sum + (s?.duration || 0), 0) || 60) * 60 * 1000
      await step.sleep("service-duration", serviceDuration + 30 * 60 * 1000) // Add 30 min buffer

      // Step 6: Send completion follow-up
      await step.runAction(internal.notifications.sendCompletionFollowUp, {
        bookingId: args.bookingId,
      })
    }

    return { success: true }
  },
})

export const getBookingDetails = internal.query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) return null

    const services = await Promise.all(booking.serviceIds.map((id) => ctx.db.get(id)))

    return {
      ...booking,
      services,
    }
  },
})

export const updateBookingStatus = internal.mutation({
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
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      ...(args.status === "completed" && { completedAt: Date.now() }),
    })
  },
})
