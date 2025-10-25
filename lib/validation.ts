// Form validation utilities

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateVehicle(data: {
  make: string
  model: string
  year: number
  color: string
  vehicleType: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.make || data.make.trim().length < 2) {
    errors.make = "Make must be at least 2 characters"
  }

  if (!data.model || data.model.trim().length < 1) {
    errors.model = "Model is required"
  }

  const currentYear = new Date().getFullYear()
  if (data.year < 1900 || data.year > currentYear + 1) {
    errors.year = `Year must be between 1900 and ${currentYear + 1}`
  }

  if (!data.color || data.color.trim().length < 2) {
    errors.color = "Color must be at least 2 characters"
  }

  if (!data.vehicleType) {
    errors.vehicleType = "Vehicle type is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateService(data: {
  name: string
  description: string
  basePrice: number
  duration: number
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Service name must be at least 3 characters"
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters"
  }

  if (data.basePrice <= 0) {
    errors.basePrice = "Base price must be greater than 0"
  }

  if (data.duration < 15 || data.duration > 480) {
    errors.duration = "Duration must be between 15 and 480 minutes"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateBooking(data: {
  vehicleId: string | null
  serviceIds: string[]
  scheduledDate?: Date
  location: {
    address: string
    city: string
    state: string
    zipCode: string
  }
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.vehicleId) {
    errors.vehicle = "Please select a vehicle"
  }

  if (data.serviceIds.length === 0) {
    errors.services = "Please select at least one service"
  }

  if (!data.scheduledDate) {
    errors.date = "Please select a date and time"
  } else if (data.scheduledDate < new Date()) {
    errors.date = "Scheduled date must be in the future"
  }

  if (!data.location.address || data.location.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters"
  }

  if (!data.location.city || data.location.city.trim().length < 2) {
    errors.city = "City is required"
  }

  if (!data.location.state || data.location.state.trim().length < 2) {
    errors.state = "State is required"
  }

  if (!data.location.zipCode || !/^\d{5}(-\d{4})?$/.test(data.location.zipCode)) {
    errors.zipCode = "Valid ZIP code is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
