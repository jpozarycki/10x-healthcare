import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { ProfileService } from '../../../services/profile/profile.service'
import { logger } from '../../../utils/logger'
import { errorResponseSchema } from '../../../schemas/profile.schema'
import { ZodError } from 'zod'

export async function GET() {
  const routeLogger = logger.withContext({ route: '/api/v1/profile', method: 'GET' });
  
  try {
    routeLogger.info('Processing profile request');
    
    // Create Supabase server client
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      routeLogger.warn('Authentication failed', { error: authError?.message });
      return NextResponse.json(
        errorResponseSchema.parse({ error: 'Authentication required' }),
        { status: 401 }
      )
    }
    
    routeLogger.debug('User authenticated', { userId: user.id });
    
    // Use the profile service to get the user profile
    const profileService = new ProfileService()
    
    try {
      const profile = await profileService.getUserProfile(user.id)
      
      if (!profile) {
        routeLogger.info('Profile not found', { userId: user.id });
        return NextResponse.json(
          errorResponseSchema.parse({ error: 'Profile not found' }),
          { status: 404 }
        )
      }
      
      routeLogger.info('Profile retrieved successfully', { userId: user.id });
      return NextResponse.json(profile)
    } catch (serviceError) {
      routeLogger.error('Service error', { 
        userId: user.id,
        error: serviceError instanceof Error ? serviceError.message : String(serviceError)
      });
      
      // Check if it's a validation error
      if (serviceError instanceof Error && serviceError.message.includes('validation failed')) {
        return NextResponse.json(
          errorResponseSchema.parse({ error: 'Invalid profile data structure' }),
          { status: 422 }
        )
      }
      
      return NextResponse.json(
        errorResponseSchema.parse({ error: 'An error occurred while retrieving the profile' }),
        { status: 500 }
      )
    }
  } catch (error) {
    routeLogger.error('Unexpected error', { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    // If it's a Zod error, we have invalid data in our request or response
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      errorResponseSchema.parse({ error: 'An unexpected error occurred' }),
      { status: 500 }
    )
  }
} 