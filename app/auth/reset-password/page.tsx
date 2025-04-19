import { ResetPasswordForm } from '../components/reset-password-form'
import { Card, CardContent } from '@/components/ui/card'

export default function ResetPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
} 