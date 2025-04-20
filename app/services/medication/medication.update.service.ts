import { createServerClient } from '@supabase/ssr';
import { Database } from '@/app/db/database.types';
import { CreateMedicationRequest, MedicationDetailResponse } from '@/app/types';

type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; statusCode: number } | null;
};

export class MedicationUpdateService {
  constructor(private readonly supabase: ReturnType<typeof createServerClient<Database>>) {}

  async updateMedication(
    medicationId: string,
    userId: string,
    updateData: CreateMedicationRequest
  ): Promise<ServiceResponse<MedicationDetailResponse>> {
    try {
      // Check if medication exists and belongs to user
      const { data: existingMedication, error: fetchError } = await this.supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !existingMedication) {
        return {
          data: null,
          error: {
            message: fetchError?.message || 'Medication not found',
            statusCode: fetchError ? 500 : 404
          }
        };
      }
      
      // Prepare medication update data
      const medicationUpdate = {
        name: updateData.name,
        form: updateData.form,
        strength: updateData.strength,
        strength_unit_id: updateData.strength_unit_id,
        category: updateData.category,
        purpose: updateData.purpose,
        instructions: updateData.instructions,
        start_date: updateData.start_date,
        end_date: updateData.end_date,
        refill_reminder_days: updateData.refill_reminder_days,
        pills_per_refill: updateData.pills_per_refill,
        updated_at: new Date().toISOString()
      };
      
      // Start transaction
      const { error: updateError } = await this.supabase
        .from('medications')
        .update(medicationUpdate)
        .eq('id', medicationId)
        .eq('user_id', userId);
      
      if (updateError) {
        return {
          data: null,
          error: {
            message: updateError.message,
            statusCode: 500
          }
        };
      }
      
      // Update or create schedule
      const { data: existingSchedules } = await this.supabase
        .from('medication_schedules')
        .select('*')
        .eq('medication_id', medicationId);
      
      const scheduleData = {
        medication_id: medicationId,
        schedule_type: updateData.schedule.type,
        schedule_pattern: updateData.schedule.pattern as unknown as Database['public']['Tables']['medication_schedules']['Row']['schedule_pattern'],
        dose_amount: 1, // Default value as it's required
        with_food: updateData.schedule.with_food,
        start_date: updateData.start_date,
        end_date: updateData.end_date,
        updated_at: new Date().toISOString()
      };
      
      if (existingSchedules && existingSchedules.length > 0) {
        await this.supabase
          .from('medication_schedules')
          .update(scheduleData)
          .eq('id', existingSchedules[0].id);
      } else {
        await this.supabase
          .from('medication_schedules')
          .insert(scheduleData);
      }
      
      // Fetch updated medication with schedules
      const { data: updatedMedication, error: fetchUpdatedError } = await this.supabase
        .from('medications')
        .select(`
          *,
          schedules:medication_schedules(*)
        `)
        .eq('id', medicationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchUpdatedError) {
        return {
          data: null,
          error: {
            message: fetchUpdatedError.message,
            statusCode: 500
          }
        };
      }
      
      return {
        data: updatedMedication as unknown as MedicationDetailResponse,
        error: null
      };
      
    } catch (error: any) {
      console.error('Error in updateMedication service:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Internal server error',
          statusCode: 500
        }
      };
    }
  }
} 