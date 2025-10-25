import { v } from "convex/values"
import { internalAction } from "./_generated/server"
import { internal } from "./_generated/api"

export const sendBookingConfirmation = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.workflows.bookingWorkflow.getBookingDetails, {
      bookingId: args.bookingId,
    })

    if (!booking) return

    const user = await ctx.runQuery(internal.notifications.getUserById, { userId: booking.userId })

    console.log(`[Notification] Booking confirmation sent to ${user?.email}`)
    console.log(`  Booking ID: ${args.bookingId}`)
    console.log(`  Scheduled: ${new Date(booking.scheduledDate).toLocaleString()}`)
    console.log(`  Total: $${booking.totalPrice}`)

    // In production, integrate with email service (SendGrid, Resend, etc.)
    // await sendEmail({
    //   to: user?.email,
    //   subject: "Booking Confirmed - AutoDetail Pro",
    //   template: "booking-confirmation",
    //   data: { booking, user }
    // })

    return { success: true }
  },
})

export const sendBookingReminder = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.workflows.bookingWorkflow.getBookingDetails, {
      bookingId: args.bookingId,
    })

    if (!booking || booking.status === "cancelled") return

    const user = await ctx.runQuery(internal.notifications.getUserById, { userId: booking.userId })

    console.log(`[Notification] Booking reminder sent to ${user?.email}`)
    console.log(`  Booking ID: ${args.bookingId}`)
    console.log(`  Scheduled: ${new Date(booking.scheduledDate).toLocaleString()}`)
    console.log(`  Location: ${booking.location.address}`)

    return { success: true }
  },
})

export const sendCompletionFollowUp = internalAction({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.runQuery(internal.workflows.bookingWorkflow.getBookingDetails, {
      bookingId: args.bookingId,
    })

    if (!booking) return

    const user = await ctx.runQuery(internal.notifications.getUserById, { userId: booking.userId })

    console.log(`[Notification] Completion follow-up sent to ${user?.email}`)
    console.log(`  Booking ID: ${args.bookingId}`)
    console.log(`  Request for review and feedback`)

    return { success: true }
  },
})

export const getUserById = internal.query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})
