import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { recoverPasswordFormSchema } from '@/app/schemas/auth.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const result = recoverPasswordFormSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Extract validated data
    const { email } = result.data
    
    const supabase = await createClient()

    // Attempt to send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    // We don't want to reveal if the email exists in our system
    // So we return a success message even if the email doesn't exist
    if (error) {
      console.error('Password recovery error:', error)
    }

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    })
  } catch (error) {
    console.error('Password recovery error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
} 