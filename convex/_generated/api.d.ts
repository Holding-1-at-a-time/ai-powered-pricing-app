/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bookings from "../bookings.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as jobs_pricingUpdates from "../jobs/pricingUpdates.js";
import type * as notifications from "../notifications.js";
import type * as pricing from "../pricing.js";
import type * as seed from "../seed.js";
import type * as services from "../services.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";
import type * as workflows_bookingWorkflow from "../workflows/bookingWorkflow.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bookings: typeof bookings;
  crons: typeof crons;
  http: typeof http;
  "jobs/pricingUpdates": typeof jobs_pricingUpdates;
  notifications: typeof notifications;
  pricing: typeof pricing;
  seed: typeof seed;
  services: typeof services;
  users: typeof users;
  vehicles: typeof vehicles;
  "workflows/bookingWorkflow": typeof workflows_bookingWorkflow;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
