"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Package } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

export function AdminServices() {
  const services = useQuery(api.services.getAllServices)
  const createService = useMutation(api.services.createService)
  const updateService = useMutation(api.services.updateService)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Id<"services"> | null>(null)

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    category: "exterior" as const,
    basePrice: 0,
    duration: 60,
    vehicleTypeMultipliers: {
      sedan: 1.0,
      suv: 1.4,
      truck: 1.5,
      van: 1.6,
      coupe: 1.0,
      luxury: 1.3,
    },
  })

  const handleCreateService = async () => {
    try {
      await createService(newService)
      setIsAddDialogOpen(false)
      setNewService({
        name: "",
        description: "",
        category: "exterior",
        basePrice: 0,
        duration: 60,
        vehicleTypeMultipliers: {
          sedan: 1.0,
          suv: 1.4,
          truck: 1.5,
          van: 1.6,
          coupe: 1.0,
          luxury: 1.3,
        },
      })
    } catch (error) {
      console.error("Error creating service:", error)
    }
  }

  const handleToggleActive = async (serviceId: Id<"services">, currentStatus: boolean) => {
    try {
      await updateService({ serviceId, isActive: !currentStatus })
    } catch (error) {
      console.error("Error updating service:", error)
    }
  }

  if (services === undefined) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold">Service Catalog</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Premium Exterior Detail"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Complete exterior wash, clay bar treatment, polish, and wax"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newService.category}
                      onValueChange={(value: any) => setNewService({ ...newService, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exterior">Exterior</SelectItem>
                        <SelectItem value="interior">Interior</SelectItem>
                        <SelectItem value="full-detail">Full Detail</SelectItem>
                        <SelectItem value="specialty">Specialty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Base Price ($)</Label>
                    <Input
                      type="number"
                      value={newService.basePrice}
                      onChange={(e) => setNewService({ ...newService, basePrice: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Vehicle Type Multipliers</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {Object.entries(newService.vehicleTypeMultipliers).map(([type, multiplier]) => (
                      <div key={type}>
                        <Label className="text-xs capitalize">{type}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={multiplier}
                          onChange={(e) =>
                            setNewService({
                              ...newService,
                              vehicleTypeMultipliers: {
                                ...newService.vehicleTypeMultipliers,
                                [type]: Number.parseFloat(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreateService} className="w-full bg-accent text-accent-foreground">
                  Create Service
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No services created yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service._id} className="p-6 border-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold">{service.name}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {service.category}
                      </Badge>
                      <Badge className={service.isActive ? "bg-success/10 text-success" : "bg-muted"}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Base Price: </span>
                        <span className="font-semibold">${service.basePrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-semibold">{service.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(service._id, service.isActive)}
                      className="bg-transparent"
                    >
                      {service.isActive ? "Deactivate" : "Activate"}
                    </Button>
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
