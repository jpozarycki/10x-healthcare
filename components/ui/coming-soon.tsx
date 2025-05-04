"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ComingSoonProps {
  featureName: string
}

export function ComingSoon({ featureName }: ComingSoonProps) {
  const router = useRouter()

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Coming Soon</CardTitle>
          <CardDescription className="text-lg">
            The {featureName} feature is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
          <Button 
            variant="default" 
            onClick={() => router.push('/medications')}
            className="w-full"
          >
            Go to Medications
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 