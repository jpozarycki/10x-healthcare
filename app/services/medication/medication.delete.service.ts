import { createServerClient } from '@supabase/ssr'
import { Database } from '@/app/db/database.types'
import { logger } from '@/app/utils/logger'

export class MedicationDeleteService {
  private logger = logger.withContext({ service: 'MedicationDeleteService' });

  constructor(private readonly supabase: ReturnType<typeof createServerClient<Database>>) {}

  /**
   * Deletes a medication and all its related records
   * @param userId The ID of the user who owns the medication
   * @param medicationId The ID of the medication to delete
   * @throws Error if deletion fails or medication not found
   */
  async deleteMedication(userId: string, medicationId: string): Promise<void> {
    this.logger.info('Deleting medication', { userId, medicationId });

    // Check if medication exists and belongs to user
    const { data: medication, error: fetchError } = await this.supabase
      .from('medications')
      .select('id, name, form, strength')
      .eq('id', medicationId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        this.logger.warn('Medication not found or unauthorized', { userId, medicationId });
        throw new Error('Medication not found');
      }
      this.logger.error('Error fetching medication', { 
        userId, 
        medicationId,
        error: fetchError.message
      });
      throw new Error(`Failed to fetch medication: ${fetchError.message}`);
    }

    try {
      // Delete related records in order
      await this.deleteNotifications(medicationId, userId);
      await this.deleteAdherenceRecords(medicationId, userId);
      await this.deleteMedicationSchedules(medicationId, userId);
      await this.deleteMedicationEscalationRules(medicationId, userId);
      await this.deleteMedicationPhotos(medicationId, userId);
      await this.deleteMedicationInteractions(medicationId, userId);

      // Finally delete the medication itself
      const { error: deleteError } = await this.supabase
        .from('medications')
        .delete()
        .eq('id', medicationId)
        .eq('user_id', userId);

      if (deleteError) {
        this.logger.error('Error deleting medication', {
          userId,
          medicationId,
          error: deleteError.message
        });
        throw new Error(`Failed to delete medication: ${deleteError.message}`);
      }

      this.logger.info('Medication deleted successfully', { userId, medicationId });
    } catch (error) {
    this.logger.info('Failed to delete medication', { userId, medicationId });
      throw error;
    }
  }

  private async deleteNotifications(medicationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('medication_id', medicationId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error('Error deleting notifications', {
        userId,
        medicationId,
        error: error.message
      });
      throw new Error(`Failed to delete notifications: ${error.message}`);
    }
  }

  private async deleteAdherenceRecords(medicationId: string, userId: string): Promise<void> {
    // todo fix this
    
    // const { error } = await this.supabase
    //   .from('adherence_records')
    //   .delete()
    //   .eq('medication_id', medicationId)
    //   .eq('user_id', userId);

    // if (error) {
    //   this.logger.error('Error deleting adherence records', {
    //     userId,
    //     medicationId,
    //     error: error.message
    //   });
    //   throw new Error(`Failed to delete adherence records: ${error.message}`);
    // }
  }

  private async deleteMedicationSchedules(medicationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('medication_schedules')
      .delete()
      .eq('medication_id', medicationId);

    if (error) {
      this.logger.error('Error deleting medication schedules', {
        userId,
        medicationId,
        error: error.message
      });
      throw new Error(`Failed to delete medication schedules: ${error.message}`);
    }
  }

  private async deleteMedicationEscalationRules(medicationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('medication_escalation_rules')
      .delete()
      .eq('medication_id', medicationId);

    if (error) {
      this.logger.error('Error deleting medication escalation rules', {
        userId,
        medicationId,
        error: error.message
      });
      throw new Error(`Failed to delete medication escalation rules: ${error.message}`);
    }
  }

  private async deleteMedicationPhotos(medicationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('medication_photos')
      .delete()
      .eq('medication_id', medicationId);

    if (error) {
      this.logger.error('Error deleting medication photos', {
        userId,
        medicationId,
        error: error.message
      });
      throw new Error(`Failed to delete medication photos: ${error.message}`);
    }
  }

  private async deleteMedicationInteractions(medicationId: string, userId: string): Promise<void> {
    // Delete records where medication is medication_id_1
    const { error: error1 } = await this.supabase
      .from('medication_interactions')
      .delete()
      .eq('medication_id_1', medicationId);

    if (error1) {
      this.logger.error('Error deleting medication interactions (medication_id_1)', {
        userId,
        medicationId,
        error: error1.message
      });
      throw new Error(`Failed to delete medication interactions: ${error1.message}`);
    }

    // Delete records where medication is medication_id_2
    const { error: error2 } = await this.supabase
      .from('medication_interactions')
      .delete()
      .eq('medication_id_2', medicationId);

    if (error2) {
      this.logger.error('Error deleting medication interactions (medication_id_2)', {
        userId,
        medicationId,
        error: error2.message
      });
      throw new Error(`Failed to delete medication interactions: ${error2.message}`);
    }
  }
} 