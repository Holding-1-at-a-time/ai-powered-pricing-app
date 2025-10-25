"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar, MapPin, Car, User, CheckCircle2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

export function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const allBookings = useQuery(
    api.bookings.getAllBookings,
    statusFilter === "all" ? {} : { status: statusFilter as any },
  )
  const updateStatus = useMutation(api.bookings.updateBookingStatus)

  const handleStatusChange = async (bookingId: Id<"bookings">, newStatus: any) => {
    try {
      await updateStatus({ bookingId, status: newStatus })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success border-success/20"
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "in-progress":
        return "bg-accent/10 text-accent border-accent/20"
      case "completed":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  if (allBookings === undefined) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold">All Bookings</h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {allBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allBookings.map((booking) => (
              <Card key={booking._id} className="p-6 border-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(booking.status)}>
                      <span className="capitalize">{booking.status}</span>
                    </Badge>
                    <span className="text-sm text-muted-foreground">#{booking._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-accent">${booking.totalPrice}</p>
                    <p className="text-xs text-muted-foreground">
                      Booked {format(new Date(booking._creationTime), "MMM d")}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-semibold">{booking.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Car className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{booking.vehicle?.vehicleType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-semibold">{format(new Date(booking.scheduledDate), "PPP")}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(booking.scheduledDate), "p")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {booking.location.city}, {booking.location.state}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Services</h4>
                    <ul className="space-y-1">
                      {booking.services.map((service) => (
                        <li key={service._id} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          {service.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">Update Status:</span>
                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(booking._id, "confirmed")}
                          className="bg-success text-success-foreground hover:bg-success/90"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(booking._id, "cancelled")}
                          className="bg-transparent"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(booking._id, "in-progress")}
                        className="bg-accent text-accent-foreground"
                      >
                        Start Service
                      </Button>
                    )}
                    {booking.status === "in-progress" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(booking._id, "completed")}
                        className="bg-success text-success-foreground hover:bg-success/90"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
