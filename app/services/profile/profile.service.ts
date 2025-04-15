import { createClient } from '../../lib/supabase/server'
import { GetProfileResponse } from '../../types'
import { logger } from '../../utils/logger'
import { userProfileSchema, UserProfile } from '../../schemas/profile.schema'
import { ZodError } from 'zod'

export class ProfileService {
  private logger = logger.withContext({ service: 'ProfileService' });

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    this.logger.info('Fetching user profile', { userId });
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        age,
        gender,
        weight,
        weight_unit,
        health_conditions,
        allergies,
        timezone
      `)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      this.logger.error('Error fetching user profile', { 
        userId, 
        error: error.message,
        code: error.code
      });
      throw new Error('Failed to fetch user profile');
    }
    
    if (!data) {
      this.logger.debug('User profile not found', { userId });
      return null;
    }

    try {
      // Validate and parse the data using Zod schema
      const validatedProfile = userProfileSchema.parse(data);
      
      this.logger.debug('User profile validated successfully', { userId });
      return validatedProfile;
    } catch (err) {
      if (err instanceof ZodError) {
        this.logger.error('Profile validation failed', { 
          userId, 
          errors: err.errors 
        });
        throw new Error(`Profile data validation failed: ${err.message}`);
      }
      throw err;
    }
  }
} 