import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AlertsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Alerts</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Medication Reminders</CardTitle>
          <CardDescription>Your medication reminder history</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No reminder history available yet.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Critical Alerts</CardTitle>
          <CardDescription>Important notifications about your medications</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No critical alerts at this time.</p>
        </CardContent>
      </Card>
    </div>
  )
} 