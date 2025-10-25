"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, DollarSign, Calendar } from "lucide-react"
import { subDays } from "date-fns"

export function AdminAnalytics() {
  const [dateRange] = useState({
    startDate: subDays(new Date(), 30).getTime(),
    endDate: new Date().getTime(),
  })

  const analytics = useQuery(api.pricing.getPricingAnalytics, dateRange)
  const allBookings = useQuery(api.bookings.getAllBookings, {})

  if (analytics === undefined || allBookings === undefined) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  const COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"]

  const statusData = [
    { name: "Pending", value: allBookings.filter((b) => b.status === "pending").length },
    { name: "Confirmed", value: allBookings.filter((b) => b.status === "confirmed").length },
    { name: "In Progress", value: allBookings.filter((b) => b.status === "in-progress").length },
    { name: "Completed", value: allBookings.filter((b) => b.status === "completed").length },
    { name: "Cancelled", value: allBookings.filter((b) => b.status === "cancelled").length },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-display font-bold">{analytics.totalBookings}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acceptance Rate</p>
              <p className="text-2xl font-display font-bold">{analytics.acceptanceRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Base Price</p>
              <p className="text-2xl font-display font-bold">${analytics.avgBasePrice}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Final Price</p>
              <p className="text-2xl font-display font-bold">${analytics.avgFinalPrice}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Pricing by Vehicle Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.priceByVehicleType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicleType" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgPrice" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={(entry) => entry.name}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Vehicle Type Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold mb-4">Vehicle Type Performance</h3>
        <div className="space-y-3">
          {analytics.priceByVehicleType.map((item) => (
            <div key={item.vehicleType} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-semibold capitalize">{item.vehicleType}</p>
                <p className="text-sm text-muted-foreground">{item.count} bookings</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-display font-bold text-accent">${item.avgPrice}</p>
                <p className="text-sm text-muted-foreground">avg price</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
