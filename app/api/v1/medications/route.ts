import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { MedicationService } from '../../../services/medication/medication.service'
import { logger } from '../../../utils/logger'
import { createMedicationSchema, validationErrorResponseSchema, createMedicationResponseSchema } from '../../../schemas/medication.schema'
import { ZodError } from 'zod'
import { InteractionSeverity } from '../../../types'

// Rate limiting variables (simple in-memory implementation)
const requestCounts = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT = 10; // requests per minute per user
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export async function POST(request: Request) {
  const routeLogger = logger.withContext({ route: '/api/v1/medications', method: 'POST' });
  
  try {
    routeLogger.info('Processing new medication request');
    
    // Create Supabase server client
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn('Authentication failed', { error: authError?.message });
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    routeLogger.debug('User authenticated', { userId: user.id });
    
    // Check rate limiting
    if (isRateLimited(user.id)) {
      routeLogger.warn('Rate limit exceeded', { userId: user.id });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Increment rate limit counter
    incrementRateLimitCounter(user.id);
    
    // Parse request body
    let medicationData;
    try {
      const body = await request.json();
      medicationData = createMedicationSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        routeLogger.warn('Validation failed', { errors: err.errors });
        return NextResponse.json(
          validationErrorResponseSchema.parse({
            error: 'Invalid data format',
            details: err.errors.map(e => ({
              path: e.path,
              message: e.message
            }))
          }),
          { status: 400 }
        );
      }
      throw err; // Re-throw other errors to be caught by the outer try/catch
    }
    
    // Additional validation: end date must be after start date
    if (medicationData.end_date && medicationData.start_date) {
      const startDate = new Date(medicationData.start_date);
      const endDate = new Date(medicationData.end_date);
      
      if (endDate < startDate) {
        routeLogger.warn('End date before start date', { 
          userId: user.id,
          startDate: medicationData.start_date,
          endDate: medicationData.end_date
        });
        
        return NextResponse.json({
          error: 'End date must be after start date',
          details: [{
            path: ['end_date'],
            message: 'End date must be after start date'
          }]
        }, { status: 400 });
      }
    }
    
    // Use the medication service to create a new medication
    const medicationService = new MedicationService();
    
    // First, validate medication interactions
    try {
      const interactionResult = await medicationService.validateMedicationInteractions(
        user.id,
        medicationData
      );
      
      // If we detected high-severity interactions, return an error
      if (interactionResult.has_interactions && interactionResult.severity_level === InteractionSeverity.HIGH) {
        routeLogger.warn('Critical medication interactions detected', { 
          userId: user.id,
          interactions: interactionResult.interactions 
        });
        
        return NextResponse.json({
          error: 'Critical medication interactions detected',
          interactions: interactionResult.interactions,
          severity: interactionResult.severity_level,
          disclaimer: interactionResult.disclaimer
        }, { status: 400 });
      }
      
      // If interactions were found but aren't critical, proceed with creation
      // In a real app, we might want to ask the user for confirmation first
      if (interactionResult.has_interactions) {
        routeLogger.info('Non-critical medication interactions detected, proceeding with creation', { 
          userId: user.id,
          severity: interactionResult.severity_level
        });
      }
    } catch (error) {
      routeLogger.error('Error validating medication interactions', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // We'll continue with creation even if interaction validation fails
      // But we log the error for debugging purposes
    }
    
    // Create the medication in a try/catch block for better error handling
    try {
      const medicationId = await medicationService.createMedication(user.id, medicationData);
      
      routeLogger.info('Medication created successfully', { userId: user.id, medicationId });
      
      // Log this action for audit purposes
      await logAction(user.id, 'create_medication', { medicationId, medicationName: medicationData.name });
      
      return NextResponse.json(
        createMedicationResponseSchema.parse({
          id: medicationId,
          message: 'Medication created successfully'
        }), 
        { status: 201 }
      );
    } catch (serviceError) {
      routeLogger.error('Service error during medication creation', {
        userId: user.id,
        error: serviceError instanceof Error ? serviceError.message : String(serviceError)
      });
      
      // Categorize database errors for more specific client responses
      if (serviceError instanceof Error) {
        if (serviceError.message.includes('foreign key constraint')) {
          return NextResponse.json(
            { error: 'Referenced entity does not exist (e.g. invalid strength_unit_id)' },
            { status: 400 }
          );
        } else if (serviceError.message.includes('unique constraint')) {
          return NextResponse.json(
            { error: 'A medication with these details already exists' },
            { status: 409 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'An error occurred while creating the medication' },
        { status: 500 }
      );
    }
  } catch (error) {
    routeLogger.error('Unexpected error during medication creation', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Try to capture additional diagnostic information
    const errorContext = {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    routeLogger.error('Error diagnostics', errorContext);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Checks if a user has exceeded the rate limit
 * @param userId The user ID to check
 * @returns True if rate limited, false otherwise
 */
function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(userId);
  
  if (!userRequests) {
    return false;
  }
  
  // If the window has expired, reset the counter
  if (now - userRequests.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(userId, { count: 0, timestamp: now });
    return false;
  }
  
  return userRequests.count >= RATE_LIMIT;
}

/**
 * Increments the rate limit counter for a user
 * @param userId The user ID to increment
 */
function incrementRateLimitCounter(userId: string): void {
  const now = Date.now();
  const userRequests = requestCounts.get(userId);
  
  if (!userRequests) {
    requestCounts.set(userId, { count: 1, timestamp: now });
    return;
  }
  
  // If the window has expired, reset the counter
  if (now - userRequests.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(userId, { count: 1, timestamp: now });
    return;
  }
  
  // Increment the counter
  requestCounts.set(userId, { 
    count: userRequests.count + 1, 
    timestamp: userRequests.timestamp 
  });
}

/**
 * Logs an action to the audit log
 * @param userId The user ID
 * @param action The action performed
 * @param details Additional details about the action
 */
async function logAction(userId: string, action: string, details: Record<string, any>): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details,
        ip_address: '0.0.0.0', // In a real implementation, you would get the client IP
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // Log but don't throw - we don't want audit logging failures to affect the main flow
    logger.error('Failed to log action to audit log', {
      userId,
      action,
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 