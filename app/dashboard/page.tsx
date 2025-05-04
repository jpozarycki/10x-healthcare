import { isFeatureEnabled } from "@/app/features/featureFlags"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function DashboardPage() {
  if (!isFeatureEnabled('dashboard')) {
    return <ComingSoon featureName="Dashboard" />
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {/* Your dashboard content here */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Dashboard</CardTitle>
          <CardDescription>
            View your health metrics and upcoming appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Dashboard content will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  )
} 