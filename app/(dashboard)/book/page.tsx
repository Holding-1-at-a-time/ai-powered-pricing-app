"use client"

import { useState } from "react"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Check, Loader2, Sparkles, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { Id } from "@/convex/_generated/dataModel"

export default function BookServicePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1: Vehicle selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<Id<"vehicles"> | null>(null)
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  // Step 2: Service selection
  const [selectedServiceIds, setSelectedServiceIds] = useState<Id<"services">[]>([])

  // Step 3: Date/Time selection
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Step 4: Location
  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [notes, setNotes] = useState("")

  // Pricing
  const [pricing, setPricing] = useState<any>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)

  // Queries
  const user = useQuery(api.users.getCurrentUser)
  const vehicles = useQuery(api.vehicles.getUserVehicles)
  const services = useQuery(api.services.getAllServices)

  // Actions & Mutations
  const calculatePrice = useAction(api.pricing.calculateDynamicPrice)
  const createBooking = useMutation(api.bookings.createBooking)
  const addVehicle = useMutation(api.vehicles.addVehicle)

  // New vehicle form
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    vehicleType: "sedan" as const,
  })

  const selectedVehicle = vehicles?.find((v) => v._id === selectedVehicleId)
  const selectedServices = services?.filter((s) => selectedServiceIds.includes(s._id))

  const handleAddVehicle = async () => {
    try {
      const vehicleId = await addVehicle(newVehicle)
      setSelectedVehicleId(vehicleId)
      setShowAddVehicle(false)
      setStep(2)
    } catch (error) {
      console.error("Error adding vehicle:", error)
    }
  }

  const handleCalculatePrice = async () => {
    if (!selectedVehicleId || !selectedVehicle || selectedServiceIds.length === 0 || !selectedDate || !selectedTime) {
      return
    }

    setLoadingPrice(true)
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const scheduledDateTime = new Date(selectedDate)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      const result = await calculatePrice({
        serviceIds: selectedServiceIds,
        vehicleType: selectedVehicle.vehicleType,
        scheduledDate: scheduledDateTime.getTime(),
        userId: user?._id,
      })

      setPricing(result)
      setStep(4)
    } catch (error) {
      console.error("Error calculating price:", error)
    } finally {
      setLoadingPrice(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedVehicleId || !selectedDate || !selectedTime || !pricing) {
      return
    }

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const scheduledDateTime = new Date(selectedDate)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      await createBooking({
        vehicleId: selectedVehicleId,
        serviceIds: selectedServiceIds,
        scheduledDate: scheduledDateTime.getTime(),
        totalPrice: pricing.finalPrice,
        aiPricingFactors: {
          basePrice: pricing.basePrice,
          vehicleMultiplier: pricing.vehicleMultiplier,
          demandMultiplier: pricing.demandMultiplier,
          seasonalMultiplier: pricing.seasonalMultiplier,
          loyaltyDiscount: pricing.loyaltyDiscount,
          finalPrice: pricing.finalPrice,
        },
        location,
        notes,
      })

      router.push("/bookings?success=true")
    } catch (error) {
      console.error("Error creating booking:", error)
    }
  }

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Book a Service</h1>
        <p className="text-muted-foreground">Get AI-powered pricing tailored to your needs</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: "Vehicle" },
          { num: 2, label: "Services" },
          { num: 3, label: "Date & Time" },
          { num: 4, label: "Review" },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  step >= s.num ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-xs mt-2 text-muted-foreground">{s.label}</span>
            </div>
            {idx < 3 && <div className={cn("h-0.5 flex-1", step > s.num ? "bg-accent" : "bg-muted")} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Vehicle Selection */}
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Select Your Vehicle</h2>

              {!showAddVehicle ? (
                <>
                  <div className="space-y-3 mb-4">
                    {vehicles?.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        onClick={() => setSelectedVehicleId(vehicle._id)}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-colors",
                          selectedVehicleId === vehicle._id
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.color} • {vehicle.vehicleType}
                            </p>
                          </div>
                          {selectedVehicleId === vehicle._id && <Check className="w-5 h-5 text-accent" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={() => setShowAddVehicle(true)} className="w-full bg-transparent">
                    Add New Vehicle
                  </Button>

                  {selectedVehicleId && (
                    <Button onClick={() => setStep(2)} className="w-full mt-4 bg-accent text-accent-foreground">
                      Continue
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Make</Label>
                      <Input
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        placeholder="Toyota"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        placeholder="Camry"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: Number.parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        placeholder="Silver"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Vehicle Type</Label>
                    <Select
                      value={newVehicle.vehicleType}
                      onValueChange={(value: any) => setNewVehicle({ ...newVehicle, vehicleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="coupe">Coupe</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddVehicle(false)}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddVehicle} className="flex-1 bg-accent text-accent-foreground">
                      Add Vehicle
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <Card className="p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Select Services</h2>

              <div className="space-y-3 mb-4">
                {services?.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => {
                      if (selectedServiceIds.includes(service._id)) {
                        setSelectedServiceIds(selectedServiceIds.filter((id) => id !== service._id))
                      } else {
                        setSelectedServiceIds([...selectedServiceIds, service._id])
                      }
                    }}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedServiceIds.includes(service._id)
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedServiceIds.includes(service._id)} className="mt-1" />
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{service.category}</Badge>
                            <span className="text-sm text-muted-foreground">{service.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-semibold text-accent">From ${service.basePrice}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedServiceIds.length === 0}
                  className="flex-1 bg-accent text-accent-foreground"
                >
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <Card className="p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Choose Date & Time</h2>

              <div className="space-y-4">
                <div>
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-transparent",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          selectedTime === time
                            ? "bg-accent text-accent-foreground"
                            : "bg-transparent hover:border-accent",
                        )}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Service Location</Label>
                  <div className="space-y-3 mt-2">
                    <Input
                      placeholder="Street Address"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="City"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                      />
                      <Input
                        placeholder="State"
                        value={location.state}
                        onChange={(e) => setLocation({ ...location, state: e.target.value })}
                      />
                      <Input
                        placeholder="ZIP"
                        value={location.zipCode}
                        onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Additional Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any special requests or instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button
                  onClick={handleCalculatePrice}
                  disabled={
                    !selectedDate ||
                    !selectedTime ||
                    !location.address ||
                    !location.city ||
                    !location.state ||
                    loadingPrice
                  }
                  className="flex-1 bg-accent text-accent-foreground"
                >
                  {loadingPrice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Get Price"
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && pricing && (
            <Card className="p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Review Your Booking</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Vehicle</h3>
                  <p className="text-muted-foreground">
                    {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Services</h3>
                  <ul className="space-y-1">
                    {selectedServices?.map((service) => (
                      <li key={service._id} className="text-muted-foreground">
                        • {service.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Date & Time</h3>
                  <p className="text-muted-foreground">
                    {selectedDate && format(selectedDate, "PPPP")} at {selectedTime}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    {location.address}, {location.city}, {location.state} {location.zipCode}
                  </p>
                </div>

                {pricing.aiInsights && pricing.aiInsights.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        AI Pricing Insights
                      </h3>
                      <ul className="space-y-2">
                        {pricing.aiInsights.map((insight: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 bg-transparent">
                  Back
                </Button>
                <Button onClick={handleBooking} className="flex-1 bg-accent text-accent-foreground">
                  Confirm Booking
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Price Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Price Summary
            </h3>

            {pricing ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>${pricing.basePrice}</span>
                </div>

                {pricing.demandMultiplier !== 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Demand Adjustment</span>
                    <span className={pricing.demandMultiplier > 1 ? "text-warning" : "text-success"}>
                      {pricing.demandMultiplier > 1 ? "+" : ""}
                      {((pricing.demandMultiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {pricing.seasonalMultiplier !== 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seasonal Adjustment</span>
                    <span className={pricing.seasonalMultiplier > 1 ? "text-warning" : "text-success"}>
                      {pricing.seasonalMultiplier > 1 ? "+" : ""}
                      {((pricing.seasonalMultiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {pricing.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loyalty Discount</span>
                    <span className="text-success">-{(pricing.loyaltyDiscount * 100).toFixed(0)}%</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-accent">${pricing.finalPrice}</span>
                </div>

                <div className="bg-accent/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI-optimized pricing based on demand, seasonality, and your loyalty
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Complete the booking steps to see your personalized price
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
