/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js"
import type * as bookings from "../bookings.js"
import type * as http from "../http.js"
import type * as pricing from "../pricing.js"
import type * as services from "../services.js"
import type * as users from "../users.js"
import type * as vehicles from "../vehicles.js"

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server"

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  ApiFromModules<{
    auth: typeof auth
    bookings: typeof bookings
    http: typeof http
    pricing: typeof pricing
    services: typeof services
    users: typeof users
    vehicles: typeof vehicles
  }>,
  FunctionReference<any, "public">
> = null as any

export const internal: FilterApi<
  ApiFromModules<{
    auth: typeof auth
    bookings: typeof bookings
    http: typeof http
    pricing: typeof pricing
    services: typeof services
    users: typeof users
    vehicles: typeof vehicles
  }>,
  FunctionReference<any, "internal">
> = null as any
