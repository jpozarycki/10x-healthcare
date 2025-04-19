import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { registerFormSchema } from '@/app/schemas/auth.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const result = registerFormSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Extract validated data
    const { email, password, ...profileData } = result.data
    
    const supabase = await createClient()

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          ...profileData
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create user profile in the database
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: data.user?.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          age: profileData.age,
          gender: profileData.gender,
          weight: profileData.weight,
          weight_unit: profileData.weight_unit,
          health_conditions: profileData.health_conditions,
          allergies: profileData.allergies,
          activity_level: profileData.activity_level,
          work_type: profileData.work_type,
          health_literacy_level: profileData.health_literacy_level,
          timezone: 'UTC' // Default timezone
        }
      ])

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // We don't want to block the registration if profile creation fails
      // The profile can be created later when the user first logs in
    }

    return NextResponse.json({ 
      user: data.user,
      message: 'Registration successful. Please check your email to confirm your account.' 
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
} 