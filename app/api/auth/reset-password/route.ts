import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { resetPasswordFormSchema } from '@/app/schemas/auth.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const result = resetPasswordFormSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Extract validated data
    const { password } = result.data
    
    const supabase = await createClient()

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'Your password has been successfully reset.' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    )
  }
} 