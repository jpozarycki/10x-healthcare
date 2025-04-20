import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { Database } from '../../../../../app/db/database.types'
import { CreateMedicationRequest, MedicationDetailResponse } from '../../../../../app/types'
import { MedicationUpdateService } from '../../../../../app/services/medication/medication.update.service'
import { MedicationDeleteService } from '@/app/services/medication/medication.delete.service'
import { logger } from '@/app/utils/logger'
import { RateLimiter } from '@/app/utils/rate-limiter'
import { getAuthenticatedUser } from '@/app/utils/auth'
import { isValidUUID } from '@/app/utils/validation'

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid medication ID format')

// Validation schema
const updateMedicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  form: z.string().min(1, "Form is required"),
  strength: z.string().optional(),
  strength_unit_id: z.string().uuid().optional(),
  category: z.enum(['chronic', 'acute', 'as_needed'], {
    errorMap: () => ({ message: "Invalid medication category" })
  }),
  purpose: z.string().optional(),
  instructions: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD").optional(),
  refill_reminder_days: z.number().min(0, "Refill reminder days must be positive").optional(),
  pills_per_refill: z.number().min(0, "Pills per refill must be positive").optional(),
  schedule: z.object({
    type: z.string(),
    pattern: z.record(z.unknown()),
    times: z.array(z.string()),
    with_food: z.boolean()
  })
}).strict()
  .refine(data => {
    if (data.end_date && data.start_date > data.end_date) {
      return false;
    }
    return true;
  }, {
    message: "End date must be after start date",
    path: ["end_date"]
  })
  .transform(data => {
    // Ensure all required fields are present
    return {
      name: data.name,
      form: data.form,
      strength: data.strength,
      strength_unit_id: data.strength_unit_id,
      category: data.category,
      purpose: data.purpose,
      instructions: data.instructions,
      start_date: data.start_date,
      end_date: data.end_date,
      refill_reminder_days: data.refill_reminder_days,
      pills_per_refill: data.pills_per_refill,
      schedule: data.schedule
    } as CreateMedicationRequest;
  });

// Rate limiting configuration
const DELETE_RATE_LIMIT = {
  maxRequests: 10, // Maximum number of requests
  windowMs: 60 * 1000, // Time window in milliseconds (1 minute)
};

const rateLimiter = new RateLimiter(DELETE_RATE_LIMIT.maxRequests, DELETE_RATE_LIMIT.windowMs);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const routeLogger = logger.withContext({ 
    route: '/api/v1/medications/[id]', 
    method: 'GET',
    medicationId: params.id 
  });

  try {
    routeLogger.info('Processing medication details request');

    // Validate the medication ID format
    try {
      uuidSchema.parse(params.id);
    } catch (err) {
      if (err instanceof z.ZodError) {
        routeLogger.warn('Invalid medication ID format', { medicationId: params.id });
        return NextResponse.json(
          { error: 'Invalid medication ID format' },
          { status: 400 }
        );
      }
      throw err;
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              routeLogger.warn('Failed to set cookies in server component context');
            }
          },
        },
      }
    );

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

    // Fetch medication details
    const { data: medication, error: fetchError } = await supabase
      .from('medications')
      .select(`
        *,
        schedules:medication_schedules(*)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      routeLogger.error('Failed to fetch medication', { error: fetchError.message });
      return NextResponse.json(
        { error: 'Failed to fetch medication details' },
        { status: 500 }
      );
    }

    if (!medication) {
      routeLogger.warn('Medication not found', { 
        userId: user.id, 
        medicationId: params.id 
      });
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    routeLogger.info('Medication details retrieved successfully');
    return NextResponse.json(medication);

  } catch (error: any) {
    routeLogger.error('Unexpected error during medication retrieval', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const routeLogger = logger.withContext({ 
    route: '/api/v1/medications/[id]', 
    method: 'PUT',
    medicationId: params.id 
  });

  try {
    routeLogger.info('Processing medication update request');

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              routeLogger.warn('Failed to set cookies in server component context');
            }
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn('Authentication failed', { error: authError?.message });
      return NextResponse.json(
        { message: 'Unauthorized', error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    routeLogger.debug('User authenticated', { userId: user.id });

    // Validate medication ID
    const validId = z.string().uuid().safeParse(params.id);
    if (!validId.success) {
      routeLogger.warn('Invalid medication ID format', { id: params.id });
      return NextResponse.json(
        { message: 'Invalid medication ID', error: 'Invalid UUID format' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const requestData = await request.json();
    const validationResult = updateMedicationSchema.safeParse(requestData);
    
    if (!validationResult.success) {
      routeLogger.warn('Validation failed for update request', {
        errors: validationResult.error.format()
      });
      return NextResponse.json(
        { message: 'Validation failed', errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    routeLogger.debug('Request data validated successfully');

    // Update medication
    const medicationService = new MedicationUpdateService(supabase);
    
    routeLogger.info('Updating medication', {
      userId: user.id,
      medicationId: params.id,
      updateData: {
        ...validationResult.data,
        // Exclude potentially sensitive information
        schedule: { type: validationResult.data.schedule.type }
      }
    });

    const result = await medicationService.updateMedication(
      params.id,
      user.id,
      validationResult.data
    );

    if (result.error) {
      routeLogger.error('Failed to update medication', {
        error: result.error.message,
        statusCode: result.error.statusCode
      });
      return NextResponse.json(
        { message: result.error.message },
        { status: result.error.statusCode }
      );
    }

    routeLogger.info('Medication updated successfully', {
      medicationId: params.id,
      userId: user.id
    });

    return NextResponse.json(result.data, { status: 200 });

  } catch (error: any) {
    routeLogger.error('Unexpected error during medication update', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const log = logger.withContext({ 
    endpoint: 'DELETE /api/v1/medications/[id]',
    medicationId: params.id 
  });

  try {
    // Validate medication ID format
    if (!isValidUUID(params.id)) {
      log.warn('Invalid medication ID format');
      return NextResponse.json(
        { error: 'Invalid medication ID format' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              log.warn('Failed to set cookies in server component context');
            }
          },
        },
      }
    );

    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      log.warn('Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!rateLimiter.tryRequest(user.id)) {
      log.warn('Rate limit exceeded', { userId: user.id });
      const response = NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set(
        'X-RateLimit-Remaining', 
        rateLimiter.getRemainingRequests(user.id).toString()
      );
      response.headers.set(
        'X-RateLimit-Reset', 
        Math.ceil(rateLimiter.getTimeRemaining(user.id) / 1000).toString()
      );

      return response;
    }

    // Delete medication
    const deleteService = new MedicationDeleteService(supabase);
    await deleteService.deleteMedication(user.id, params.id);

    log.info('Medication deleted successfully');
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Medication not found') {
        log.warn('Medication not found');
        return NextResponse.json(
          { error: 'Medication not found' },
          { status: 404 }
        );
      }
      if (error.message === 'Unauthorized') {
        log.warn('Unauthorized access attempt');
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    log.error('Error deleting medication', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 