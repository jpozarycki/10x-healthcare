import { isFeatureEnabled } from "@/app/features/featureFlags"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function AlertsPage() {
  if (!isFeatureEnabled('alerts')) {
    return <ComingSoon featureName="Alerts" />
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Alerts</h1>
      {/* Your alerts content here */}
      <Card>
        <CardHeader>
          <CardTitle>Health Alerts</CardTitle>
          <CardDescription>
            Stay informed about important health updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Alerts content will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  )
} 