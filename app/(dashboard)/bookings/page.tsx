"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, MapPin, Car, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function BookingsPage() {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  const bookings = useQuery(api.bookings.getUserBookings)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (bookings === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {showSuccess && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <p className="text-success font-medium">Booking created successfully!</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your service appointments</p>
        </div>
        <Link href="/book">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Book New Service</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-6">Start by booking your first detailing service</p>
          <Link href="/book">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Book a Service</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Booked {format(new Date(booking._creationTime), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-2xl font-display font-bold text-accent">${booking.totalPrice}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{booking.vehicle?.vehicleType}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">{format(new Date(booking.scheduledDate), "PPPP")}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(booking.scheduledDate), "p")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Service Location</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.location.address}, {booking.location.city}, {booking.location.state}
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

                  {booking.notes && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {booking.aiPricingFactors && (
                <div className="mt-4 pt-4 border-t border-border">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View pricing breakdown
                    </summary>
                    <div className="mt-3 space-y-2 pl-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Price</span>
                        <span>${booking.aiPricingFactors.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Demand Factor</span>
                        <span>{booking.aiPricingFactors.demandMultiplier}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seasonal Factor</span>
                        <span>{booking.aiPricingFactors.seasonalMultiplier}x</span>
                      </div>
                      {booking.aiPricingFactors.loyaltyDiscount > 0 && (
                        <div className="flex justify-between text-success">
                          <span>Loyalty Discount</span>
                          <span>-{(booking.aiPricingFactors.loyaltyDiscount * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
