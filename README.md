# AutoDetail Pro - AI-Powered Auto Detailing Platform

A production-ready, full-stack auto detailing booking platform with AI-powered dynamic pricing, built with Next.js 16, Convex, and Clerk.

## Features

### Customer Features
- **Smart Booking System**: Multi-step booking flow with vehicle selection, service selection, and scheduling
- **AI-Powered Pricing**: Dynamic pricing based on demand, seasonality, time-of-day, and customer loyalty
- **Vehicle Management**: Save and manage multiple vehicles for faster booking
- **Booking History**: View past and upcoming bookings with detailed pricing breakdowns
- **Real-time Updates**: Live booking status updates and notifications

### Admin Features
- **Dashboard Analytics**: Comprehensive analytics with charts and metrics
- **Booking Management**: View and manage all bookings with status updates
- **Service Catalog**: Create and manage services with custom pricing multipliers
- **Pricing Insights**: AI-powered pricing analytics and acceptance rates
- **Revenue Tracking**: Track revenue and performance by vehicle type

### Technical Features
- **RAG-Powered Pricing**: Vector embeddings for intelligent pricing decisions
- **Automated Workflows**: Background jobs for notifications and status updates
- **Scheduled Tasks**: Daily analytics calculations and data cleanup
- **Authentication**: Secure authentication with Clerk
- **Real-time Database**: Convex for real-time data synchronization

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Convex (real-time database with vector search)
- **Authentication**: Clerk
- **AI/ML**: Convex RAG for pricing intelligence
- **Workflows**: Convex Workflows for background jobs
- **UI**: shadcn/ui with Tailwind CSS v4
- **Charts**: Recharts for analytics visualization

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Convex account ([Sign up](https://dashboard.convex.dev))
- Clerk account ([Sign up](https://dashboard.clerk.com))

### Installation

1. Clone the repository or download from v0

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`

3. Set up Convex:
   \`\`\`bash
   npx convex dev
   \`\`\`
   This will create a new Convex project and give you a deployment URL.

4. Set up Clerk:
   - Create a new application in [Clerk Dashboard](https://dashboard.clerk.com)
   - Enable Email/Password authentication
   - Create a webhook endpoint for user sync:
     - URL: `https://your-domain.com/api/webhooks/clerk`
     - Subscribe to: `user.created`
     - Copy the webhook secret

5. Set up environment variables in the **Vars section** of v0 sidebar:
   \`\`\`env
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...
   \`\`\`

6. Seed the database:
   \`\`\`bash
   # Seed services catalog
   npx convex run seed:seedServices
   
   # Seed pricing knowledge base
   npx convex run pricing:seedPricingKnowledge
   \`\`\`

7. Create an admin user:
   - Sign up through the app
   - Run in Convex dashboard:
     \`\`\`javascript
     await ctx.runMutation(internal.seed.createTestAdmin, {
       clerkId: "your_clerk_user_id",
       email: "admin@example.com",
       name: "Admin User"
     })
     \`\`\`

8. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

9. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   └── page.tsx         # Landing page
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── auth/            # Authentication components
│   └── ui/              # shadcn/ui components
├── convex/
│   ├── workflows/       # Workflow definitions
│   ├── jobs/            # Scheduled background jobs
│   ├── schema.ts        # Database schema
│   ├── pricing.ts       # AI pricing engine
│   ├── bookings.ts      # Booking management
│   └── services.ts      # Service catalog
└── scripts/
    └── seed-pricing-knowledge.ts  # Seed pricing data
\`\`\`

## Key Workflows

### Booking Workflow
1. Customer creates booking
2. Confirmation notification sent immediately
3. Reminder sent 24 hours before appointment
4. Auto-update to "in-progress" at scheduled time
5. Follow-up for review after completion

### Pricing Updates
- Daily knowledge base updates at 2 AM UTC
- Daily analytics calculation at 3 AM UTC
- Weekly data cleanup on Mondays at 4 AM UTC

## AI Pricing Engine

The pricing engine uses RAG (Retrieval-Augmented Generation) to make intelligent pricing decisions based on:

- **Market Trends**: Peak demand periods and booking patterns
- **Seasonal Factors**: Weather and seasonal demand variations
- **Vehicle Type**: Size and complexity multipliers
- **Customer Loyalty**: Discounts for repeat customers
- **Time-of-Day**: Premium pricing for popular time slots

## Deployment

Deploy to Vercel:

\`\`\`bash
npx vercel
\`\`\`

Make sure to set up environment variables in your Vercel project settings.

## Troubleshooting

### Missing Environment Variables

If you see "Configuration Required" messages:
1. Click the sidebar icon in v0
2. Select "Vars"
3. Add all required environment variables
4. The app will automatically restart

### Clerk Authentication Issues

- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_`
- Ensure `CLERK_SECRET_KEY` starts with `sk_`
- Verify webhook is configured correctly in Clerk Dashboard

### Convex Connection Issues

- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Ensure Convex dev server is running: `npx convex dev`
- Check Convex dashboard for deployment status

### No Services Available

Run the seed command:
\`\`\`bash
npx convex run seed:seedServices
\`\`\`

### AI Pricing Not Working

Seed the pricing knowledge base:
\`\`\`bash
npx convex run pricing:seedPricingKnowledge
\`\`\`

## API Reference

### Convex Functions

#### Queries
- `users.getCurrentUser()` - Get current authenticated user
- `vehicles.getUserVehicles()` - Get user's vehicles
- `services.getAllServices()` - Get active services
- `bookings.getUserBookings()` - Get user's bookings
- `bookings.getAllBookings(status?)` - Admin: Get all bookings

#### Mutations
- `vehicles.addVehicle(...)` - Add new vehicle
- `bookings.createBooking(...)` - Create new booking
- `bookings.updateBookingStatus(...)` - Admin: Update booking status
- `services.createService(...)` - Admin: Create service

#### Actions
- `pricing.calculateDynamicPrice(...)` - Calculate AI-powered price
- `pricing.seedPricingKnowledge()` - Seed pricing knowledge base

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server-side) |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk webhook signing secret |

## Architecture Decisions

### Why Convex?
- Real-time database with automatic synchronization
- Built-in vector search for RAG implementation
- Serverless functions with TypeScript
- Workflow engine for background jobs
- No separate backend needed

### Why Clerk?
- Production-ready authentication
- User management out of the box
- Webhook support for user sync
- Role-based access control

### AI Pricing Strategy
The pricing engine uses a hybrid approach:
1. **Base Pricing**: Service cost + vehicle type multiplier
2. **Dynamic Factors**: Demand, seasonality, time-of-day
3. **RAG Intelligence**: Historical data and market trends
4. **Loyalty Rewards**: Discounts for repeat customers

## Performance Optimizations

- React Server Components for reduced client bundle
- Parallel data fetching with Convex queries
- Optimistic updates for instant UI feedback
- Vector search indexing for fast RAG queries
- Scheduled jobs for heavy computations

## Security Features

- Row-level security with Convex auth
- Server-side validation for all mutations
- Webhook signature verification
- Role-based access control (customer/admin)
- Secure environment variable handling

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Convex docs: https://docs.convex.dev
- Review Clerk docs: https://clerk.com/docs
- Open an issue in the repository

## License

MIT

---

Built with ❤️ using Next.js, Convex, and Clerk
