import { isFeatureEnabled } from "@/app/features/featureFlags"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComingSoon } from "@/components/ui/coming-soon"

export default function EducationPage() {
  if (!isFeatureEnabled('education')) {
    return <ComingSoon featureName="Education" />
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Education</h1>
      
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

      <Card>
        <CardHeader>
          <CardTitle>Health Education Resources</CardTitle>
          <CardDescription>
            Learn more about managing your health effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Education content will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  )
} 