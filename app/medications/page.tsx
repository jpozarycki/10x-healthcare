import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function MedicationsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medications</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Medications</CardTitle>
          <CardDescription>Manage your medications and schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No medications added yet.</p>
        </CardContent>
      </Card>
    </div>
  )
} 