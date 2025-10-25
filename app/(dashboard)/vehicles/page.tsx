"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Car, Plus, Trash2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

export default function VehiclesPage() {
  const vehicles = useQuery(api.vehicles.getUserVehicles)
  const addVehicle = useMutation(api.vehicles.addVehicle)
  const deleteVehicle = useMutation(api.vehicles.deleteVehicle)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    vehicleType: "sedan" as const,
    licensePlate: "",
  })

  const handleAddVehicle = async () => {
    try {
      await addVehicle(newVehicle)
      setIsAddDialogOpen(false)
      setNewVehicle({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        vehicleType: "sedan",
        licensePlate: "",
      })
    } catch (error) {
      console.error("Error adding vehicle:", error)
    }
  }

  const handleDeleteVehicle = async (vehicleId: Id<"vehicles">) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle({ vehicleId })
      } catch (error) {
        console.error("Error deleting vehicle:", error)
      }
    }
  }

  if (vehicles === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Vehicles</h1>
          <p className="text-muted-foreground">Manage your vehicles for faster booking</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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

              <div>
                <Label>License Plate (Optional)</Label>
                <Input
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>

              <Button onClick={handleAddVehicle} className="w-full bg-accent text-accent-foreground">
                Add Vehicle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {vehicles.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">No vehicles added</h3>
          <p className="text-muted-foreground mb-6">Add your first vehicle to get started with bookings</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-accent" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVehicle(vehicle._id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="font-display font-semibold text-lg mb-1">
                {vehicle.year} {vehicle.make}
              </h3>
              <p className="text-muted-foreground mb-3">{vehicle.model}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium">{vehicle.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{vehicle.vehicleType}</span>
                </div>
                {vehicle.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License</span>
                    <span className="font-medium">{vehicle.licensePlate}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
