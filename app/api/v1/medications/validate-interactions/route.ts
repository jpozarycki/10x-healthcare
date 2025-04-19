import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { MedicationService } from '../../../../services/medication/medication.service'
import { logger } from '../../../../utils/logger'
import { validateMedicationInteractionsSchema } from '../../../../schemas/medication.schema'
import { ZodError } from 'zod'
import { CreateMedicationRequest } from '../../../../types'

export async function POST(request: Request) {
  const routeLogger = logger.withContext({ 
    route: '/api/v1/medications/validate-interactions', 
    method: 'POST' 
  });
  
  try {
    routeLogger.info('Processing medication interaction validation request');
    
    // Create Supabase server client and authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn('Authentication failed', { error: authError?.message });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    routeLogger.debug('User authenticated', { userId: user.id });
    
    // Parse request body
    let validationData: CreateMedicationRequest;
    try {
      const body = await request.json();
      validationData = body as CreateMedicationRequest;
    } catch (err) {
      routeLogger.warn('Invalid request body', { 
        error: err instanceof Error ? err.message : String(err) 
      });
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Use the medication service to validate interactions
    const medicationService = new MedicationService();
    
    try {
      const interactionResult = await medicationService.validateMedicationInteractions(
        user.id,
        validationData
      );
      
      routeLogger.info('Medication interaction check completed', { 
        userId: user.id,
        hasInteractions: interactionResult.has_interactions,
        severity: interactionResult.severity_level
      });
      
      return NextResponse.json(interactionResult);
    } catch (serviceError) {
      routeLogger.error('Service error during interaction validation', {
        userId: user.id,
        error: serviceError instanceof Error ? serviceError.message : String(serviceError)
      });
      
      return NextResponse.json(
        { error: 'An error occurred while validating medication interactions' },
        { status: 500 }
      );
    }
  } catch (error) {
    routeLogger.error('Unexpected error during interaction validation', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 