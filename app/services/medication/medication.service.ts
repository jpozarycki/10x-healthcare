import { createClient } from '../../lib/supabase/server'
import { logger } from '../../utils/logger'
import { ZodError } from 'zod'
import { 
  CreateMedicationRequest, 
  ValidateMedicationInteractionsRequest, 
  ValidateMedicationInteractionsResponse,
  MedicationInteraction,
  InteractionSeverity
} from '../../types'
import openai from '../../lib/openai/client'

export class MedicationService {
  private logger = logger.withContext({ service: 'MedicationService' });

  /**
   * Creates a new medication record in the database
   * @param userId The ID of the user who owns the medication
   * @param medicationData The medication data to create
   * @returns The ID of the newly created medication
   */
  async createMedication(userId: string, medicationData: CreateMedicationRequest): Promise<string> {
    this.logger.info('Creating new medication', { userId });
    const supabase = await createClient();

    // Start a transaction
    const { data: medications, error: medicationsError } = await supabase
      .from('medications')
      .insert({
        user_id: userId,
        name: medicationData.name,
        form: medicationData.form,
        strength: medicationData.strength,
        strength_unit_id: medicationData.strength_unit_id,
        category: medicationData.category,
        purpose: medicationData.purpose,
        instructions: medicationData.instructions,
        start_date: medicationData.start_date,
        end_date: medicationData.end_date,
        refill_reminder_days: medicationData.refill_reminder_days,
        pills_per_refill: medicationData.pills_per_refill,
        is_active: true
      })
      .select('id')
      .single();

    if (medicationsError) {
      this.logger.error('Error creating medication', { 
        userId, 
        error: medicationsError.message,
        code: medicationsError.code
      });
      throw new Error(`Failed to create medication: ${medicationsError.message}`);
    }

    const medicationId = medications.id;

    // If schedule data is provided, create a schedule record
    if (medicationData.schedule) {
      const { error: scheduleError } = await supabase
        .from('medication_schedules')
        .insert({
          medication_id: medicationId,
          schedule_type: medicationData.schedule.type,
          schedule_pattern: medicationData.schedule.pattern,
          times: medicationData.schedule.times,
          with_food: medicationData.schedule.with_food,
          start_date: medicationData.start_date,
          end_date: medicationData.end_date
        });

      if (scheduleError) {
        this.logger.error('Error creating medication schedule', { 
          userId, 
          medicationId,
          error: scheduleError.message,
          code: scheduleError.code
        });
        throw new Error(`Failed to create medication schedule: ${scheduleError.message}`);
      }
    }

    this.logger.debug('Medication created successfully', { userId, medicationId });
    return medicationId;
  }

  /**
   * Validates potential interactions between a new medication and existing medications
   * @param userId The ID of the user
   * @param newMedicationData The new medication data
   * @returns Validation result with potential interactions
   */
  async validateMedicationInteractions(
    userId: string, 
    newMedicationData: CreateMedicationRequest
  ): Promise<ValidateMedicationInteractionsResponse> {
    this.logger.info('Validating medication interactions', { userId });
    const supabase = await createClient();

    // Get user's existing medications
    const { data: existingMedications, error: medicationsError } = await supabase
      .from('medications')
      .select('id, name, strength, form')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (medicationsError) {
      this.logger.error('Error fetching user medications', { 
        userId, 
        error: medicationsError.message
      });
      throw new Error(`Failed to fetch user medications: ${medicationsError.message}`);
    }

    // Get user profile for context (health conditions, allergies, etc.)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('health_conditions, allergies, age')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      this.logger.error('Error fetching user profile', { 
        userId, 
        error: profileError.message
      });
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    // Prepare validation request
    const validationRequest: ValidateMedicationInteractionsRequest = {
      medications: existingMedications.map(med => ({
        id: med.id,
        name: med.name,
        strength: med.strength || '',
        form: med.form
      })),
      new_medication: {
        name: newMedicationData.name,
        strength: newMedicationData.strength || '',
        form: newMedicationData.form
      },
      user_context: {
        health_conditions: userProfile.health_conditions || [],
        allergies: userProfile.allergies || [],
        age: userProfile.age || 0
      }
    };

    // If no existing medications, no interactions to check
    if (existingMedications.length === 0) {
      return {
        has_interactions: false,
        severity_level: InteractionSeverity.LOW,
        interactions: [],
        disclaimer: "This is a preliminary check and does not replace professional medical advice.",
        model_version: "1.0.0",
        generated_at: new Date().toISOString()
      };
    }

    try {
      // Call OpenAI API to check for interactions
      const prompt = this.buildInteractionCheckPrompt(validationRequest);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a medical interaction analysis system. Your task is to identify potential interactions between medications.
            Consider drug-drug interactions, contraindications related to user health conditions, and potential allergic reactions.
            Rank interactions by severity (low, moderate, high) and provide specific recommendations.
            Be precise, comprehensive, and return results in the exact JSON format requested.
            Remember that patient safety is paramount, but avoid raising unnecessary alarms for minimal risks.
            Always include a medical disclaimer.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const aiResponse = response.choices[0].message.content;
      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      // Parse the AI response
      const interactionResult = JSON.parse(aiResponse) as ValidateMedicationInteractionsResponse;
      
      this.logger.debug('AI interaction check completed', { 
        userId, 
        hasInteractions: interactionResult.has_interactions,
        severity: interactionResult.severity_level
      });

      // Ensure the response has all required fields
      return {
        has_interactions: interactionResult.has_interactions || false,
        severity_level: interactionResult.severity_level || InteractionSeverity.LOW,
        interactions: interactionResult.interactions || [],
        disclaimer: interactionResult.disclaimer || "This is a preliminary check and does not replace professional medical advice.",
        model_version: interactionResult.model_version || "OpenAI GPT-4o",
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error checking medication interactions with AI', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return a fallback response without halting the process
      return {
        has_interactions: false,
        severity_level: InteractionSeverity.LOW,
        interactions: [],
        disclaimer: "There was an error checking interactions. This does not necessarily mean the medication is safe. Please consult a healthcare professional.",
        model_version: "Error fallback",
        generated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Builds the prompt for the OpenAI API to check medication interactions
   * @param validationRequest The validation request with medications and user context
   * @returns A formatted prompt string
   */
  private buildInteractionCheckPrompt(validationRequest: ValidateMedicationInteractionsRequest): string {
    const { medications, new_medication, user_context } = validationRequest;
    
    // Format existing medications
    const existingMedsText = medications.map(med => 
      `- ${med.name} (Strength: ${med.strength || 'Not specified'}, Form: ${med.form})`
    ).join('\n');
    
    // Format user context
    const healthConditionsText = user_context.health_conditions.length > 0 
      ? user_context.health_conditions.join(', ') 
      : 'None';
      
    const allergiesText = user_context.allergies.length > 0 
      ? user_context.allergies.join(', ') 
      : 'None';

    // Build the complete prompt
    return `
Please analyze for potential interactions between a new medication and existing medications.

NEW MEDICATION:
- Name: ${new_medication.name}
- Strength: ${new_medication.strength || 'Not specified'}
- Form: ${new_medication.form}

EXISTING MEDICATIONS:
${existingMedsText}

USER HEALTH CONTEXT:
- Age: ${user_context.age || 'Not specified'}
- Health Conditions: ${healthConditionsText}
- Allergies: ${allergiesText}

Based on the above information, identify any potential interactions between the new medication and the existing medications, or contraindications based on the user's health profile.

Please provide your analysis in the following JSON format only (no additional text):
{
  "has_interactions": boolean,
  "severity_level": "low" | "moderate" | "high",
  "interactions": [
    {
      "medication_pair": [string, string],
      "description": string,
      "severity": "low" | "moderate" | "high",
      "recommendations": string,
      "confidence_score": number
    }
  ],
  "disclaimer": string,
  "model_version": string
}

Where:
- has_interactions: true if any interactions were detected, false otherwise
- severity_level: the highest severity level found among all interactions (low, moderate, high)
- interactions: array of detected interactions
- medication_pair: array with [existing medication name, new medication name]
- description: detailed description of the interaction
- severity: severity level for this specific interaction (low, moderate, high)
- recommendations: recommendations for managing this interaction
- confidence_score: confidence in this interaction assessment (0.0 to 1.0)
- disclaimer: medical disclaimer
- model_version: identifier for the model or knowledge base used

The response should strictly follow this JSON format with no additional content.
`;
  }
} 