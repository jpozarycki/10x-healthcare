import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EducationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Education</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Medication Information</CardTitle>
          <CardDescription>Learn about your medications</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Add medications to see personalized education content.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Understanding Your Treatment</CardTitle>
          <CardDescription>Educational resources for your health conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Complete your health profile to see personalized resources.</p>
        </CardContent>
      </Card>
    </div>
  )
} 