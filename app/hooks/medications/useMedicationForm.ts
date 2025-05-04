import { useState, useEffect, useCallback } from "react";
import { MedicationFormViewModel } from "@/app/types/medications";
import { CreateMedicationRequest, MedicationDetailResponse } from "@/app/types";
import { useStatusModal } from "@/components/ui/status-modal";

interface UseMedicationFormProps {
  medicationId?: string | null;
}

export function useMedicationForm({ medicationId }: UseMedicationFormProps = {}) {
  const [formData, setFormData] = useState<MedicationFormViewModel>({
    name: "",
    form: "",
    strength: "",
    category: "chronic",
    startDate: new Date().toISOString().split("T")[0],
    scheduleType: "daily",
    scheduleTimes: ["08:00"],
    schedulePattern: {},
    withFood: false,
    errors: {},
    isValid: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { showStatus, showError } = useStatusModal();

  // Pobieranie danych leku, jeśli jest to edycja
  useEffect(() => {
    const fetchMedicationDetails = async () => {
      if (!medicationId) return;

      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch(`/api/v1/medications/${medicationId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data: MedicationDetailResponse = await response.json();
        
        // Mapowanie danych z API na model formularza
        const schedule = data.schedules[0] || { 
          schedule_type: "daily", 
          schedule_pattern: {}, 
          with_food: false 
        };
        
        // Bezpieczne wyodrębnienie czasów z wzorca harmonogramu
        const patternObj = schedule.schedule_pattern || {};
        const times = Array.isArray((patternObj as any).times) 
          ? (patternObj as any).times 
          : ["08:00"];
        
        setFormData({
          id: data.id,
          name: data.name,
          form: data.form,
          strength: data.strength || "",
          category: data.category,
          purpose: data.purpose || "",
          instructions: data.instructions || "",
          startDate: data.start_date,
          endDate: data.end_date || "",
          refillReminderDays: data.refill_reminder_days,
          pillsPerRefill: data.pills_per_refill,
          scheduleType: schedule.schedule_type,
          scheduleTimes: times,
          schedulePattern: patternObj,
          withFood: schedule.with_food || false,
          errors: {},
          isValid: true
        });
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching medication details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicationDetails();
  }, [medicationId]);

  // Funkcja aktualizująca pola formularza
  const updateField = useCallback(<K extends keyof MedicationFormViewModel>(
    field: K, 
    value: MedicationFormViewModel[K]
  ) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Usunięcie błędu dla zaktualizowanego pola
      if (prev.errors[field as string]) {
        const newErrors = { ...prev.errors };
        delete newErrors[field as string];
        newData.errors = newErrors;
      }
      
      return newData;
    });
  }, []);

  // Funkcja walidująca formularz
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    // Walidacja wymaganych pól
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.form.trim()) {
      errors.form = "Form is required";
    }
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else {
      // Walidacja dat
      const startDate = new Date(formData.startDate);
      
      if (isNaN(startDate.getTime())) {
        errors.startDate = "Invalid date format";
      }
      
      if (formData.endDate) {
        const endDate = new Date(formData.endDate);
        
        if (isNaN(endDate.getTime())) {
          errors.endDate = "Invalid date format";
        } else if (endDate < startDate) {
          errors.endDate = "End date must be after start date";
        }
      }
    }
    
    // Walidacja harmonogramu
    if (formData.scheduleTimes.length === 0) {
      errors.scheduleTimes = "At least one time is required";
    } else {
      // Walidacja formatów czasu
      const invalidTimeFormat = formData.scheduleTimes.some(time => {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return !timeRegex.test(time);
      });
      
      if (invalidTimeFormat) {
        errors.scheduleTimes = "Invalid time format. Use HH:MM (24h format)";
      }
    }
    
    // Walidacja wzorca harmonogramu
    if (formData.scheduleType === "weekly" && 
        (!formData.schedulePattern.days || 
          Object.keys((formData.schedulePattern as any).days || {}).length === 0)) {
      errors.schedulePattern = "Select at least one day of the week";
    }
    
    if (formData.scheduleType === "monthly" && 
        (!formData.schedulePattern.days || 
          Object.keys((formData.schedulePattern as any).days || {}).length === 0)) {
      errors.schedulePattern = "Select at least one day of the month";
    }
    
    // Walidacja pól liczbowych
    if (formData.refillReminderDays !== undefined && (isNaN(Number(formData.refillReminderDays)) || Number(formData.refillReminderDays) < 0)) {
      errors.refillReminderDays = "Refill reminder days must be a positive number";
    }
    
    if (formData.pillsPerRefill !== undefined && (isNaN(Number(formData.pillsPerRefill)) || Number(formData.pillsPerRefill) <= 0)) {
      errors.pillsPerRefill = "Pills per refill must be a positive number";
    }
    
    setFormData(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0
    }));
    
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Funkcja przygotowująca dane do wysłania
  const prepareRequestData = useCallback((): CreateMedicationRequest => {
    return {
      name: formData.name,
      form: formData.form,
      strength: formData.strength || undefined,
      strength_unit_id: formData.strengthUnitId,
      category: formData.category,
      purpose: formData.purpose,
      instructions: formData.instructions,
      start_date: formData.startDate,
      end_date: formData.endDate || undefined,
      refill_reminder_days: formData.refillReminderDays,
      pills_per_refill: formData.pillsPerRefill,
      schedule: {
        type: formData.scheduleType,
        pattern: formData.schedulePattern,
        times: formData.scheduleTimes,
        with_food: formData.withFood
      }
    };
  }, [formData]);

  // Funkcja obsługująca zapis formularza
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    let responseData: any = null;

    try {
      const data = prepareRequestData();
      const url = medicationId
        ? `/api/v1/medications/${medicationId}`
        : "/api/v1/medications";
      const method = medicationId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Success case: Check for interactions
      const interactions: { description: string; severity: string }[] = responseData?.interactions;

      if (interactions && interactions.length > 0) {
        const interactionMessage = interactions
          .map(int => `- ${int.description} (Severity: ${int.severity || 'Unknown'})`)
          .join('\n');
        
        // Show interactions using StatusModal - using 'error' variant as 'warning' is unavailable
        showStatus(
            `Medication saved, but potential interactions were detected:\n${interactionMessage}`,
            {
                title: "Interaction Warning",
                variant: "error" // Use 'error' variant for warnings
            }
        );
        return true; // Indicate success despite warning
      }

      // Success case: No interactions
      // showStatus("Medication saved successfully.", { variant: "success", title: "Success" });
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      // Show error using StatusModal
      showError(errorMessage, "Error Saving Medication");
      // Keep the error in form state as well, if needed for inline display
      setFormData(prev => ({
        ...prev,
        errors: { ...prev.errors, submit: errorMessage }
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, prepareRequestData, medicationId, showError, showStatus]);

  return {
    formData,
    isLoading,
    isSubmitting,
    fetchError,
    updateField,
    validateForm,
    handleSubmit
  };
} 