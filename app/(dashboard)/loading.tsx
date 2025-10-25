import { LoadingSpinner } from "@/components/loading-spinner"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LoadingSpinner size="lg" text="Loading dashboard..." />
    </div>
  )
}
