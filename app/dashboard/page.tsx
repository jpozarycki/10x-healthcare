import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Today's Medications</CardTitle>
          <CardDescription>Your medication schedule for today</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No medications scheduled for today.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Adherence Status</CardTitle>
          <CardDescription>Your medication adherence statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No adherence data available yet.</p>
        </CardContent>
      </Card>
    </div>
  )
} 