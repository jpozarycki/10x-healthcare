import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { BulkImportMedicationItem, BulkImportViewModel } from "@/app/types/medications";
import { CreateMedicationRequest } from "@/app/types";

export function useBulkImport() {
  const [importData, setImportData] = useState<BulkImportViewModel>({
    medications: [],
    step: "data_input",
    hasErrors: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dodanie nowego leku do listy
  const addMedication = useCallback(() => {
    const newMedication: BulkImportMedicationItem = {
      id: uuidv4(),
      name: "",
      form: "",
      strength: "",
      category: "chronic",
      startDate: new Date().toISOString().split("T")[0],
      schedule: {
        type: "daily",
        times: ["08:00"],
        withFood: false,
        pattern: {}
      },
      errors: {},
    };

    setImportData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  }, []);

  // Aktualizacja leku na liście
  const updateMedication = useCallback((id: string, updates: Partial<BulkImportMedicationItem>) => {
    setImportData(prev => ({
      ...prev,
      medications: prev.medications.map(medication => 
        medication.id === id ? { ...medication, ...updates } : medication
      )
    }));
  }, []);

  // Usunięcie leku z listy
  const removeMedication = useCallback((id: string) => {
    setImportData(prev => ({
      ...prev,
      medications: prev.medications.filter(medication => medication.id !== id)
    }));
  }, []);

  // Walidacja pojedynczego leku
  const validateMedication = useCallback((medication: BulkImportMedicationItem) => {
    const errors: Record<string, string> = {};
    
    if (!medication.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!medication.form.trim()) {
      errors.form = "Form is required";
    }
    
    if (!medication.category) {
      errors.category = "Category is required";
    }
    
    if (!medication.startDate) {
      errors.startDate = "Start date is required";
    }
    
    if (medication.schedule.type !== "as_needed" && (!medication.schedule.times || medication.schedule.times.length === 0)) {
      errors.times = "At least one time is required";
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, []);

  // Walidacja wszystkich leków
  const validateAllMedications = useCallback(() => {
    let hasErrors = false;
    
    const validatedMedications = importData.medications.map(medication => {
      const { errors, isValid } = validateMedication(medication);
      
      if (!isValid) {
        hasErrors = true;
      }
      
      return {
        ...medication,
        errors,
        isValid
      };
    });
    
    setImportData(prev => ({
      ...prev,
      medications: validatedMedications,
      hasErrors
    }));
    
    return !hasErrors;
  }, [importData.medications, validateMedication]);

  // Przejście do podglądu kalendarza
  const goToPreview = useCallback(() => {
    if (validateAllMedications()) {
      setImportData(prev => ({
        ...prev,
        step: "calendar_preview"
      }));
      return true;
    }
    return false;
  }, [validateAllMedications]);

  // Powrót do wprowadzania danych
  const goToDataInput = useCallback(() => {
    setImportData(prev => ({
      ...prev,
      step: "data_input"
    }));
  }, []);

  // Konwersja obiektu BulkImportMedicationItem do CreateMedicationRequest
  const convertToCreateRequest = useCallback((medication: BulkImportMedicationItem): CreateMedicationRequest => {
    return {
      name: medication.name,
      form: medication.form,
      strength: medication.strength || undefined,
      category: medication.category,
      start_date: medication.startDate,
      schedule: {
        type: medication.schedule.type,
        pattern: medication.schedule.pattern || {},
        times: medication.schedule.times,
        with_food: medication.schedule.withFood
      }
    };
  }, []);

  // Zapisanie importowanych leków
  const submitImport = useCallback(async () => {
    if (importData.hasErrors || importData.medications.length === 0) {
      return false;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const requests = importData.medications.map(convertToCreateRequest);
      
      const response = await fetch('/api/v1/medications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ medications: requests })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Reset formularza po pomyślnym zapisie
      setImportData({
        medications: [],
        step: "data_input",
        hasErrors: false
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error submitting bulk import:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [importData.hasErrors, importData.medications, convertToCreateRequest]);

  // Aktualizacja czasów dla wszystkich leków (używane w podglądzie kalendarza)
  const updateAllTimes = useCallback((timeKey: number, newValue: string) => {
    setImportData(prev => ({
      ...prev,
      medications: prev.medications.map(medication => {
        const times = [...medication.schedule.times];
        if (times[timeKey] !== undefined) {
          times[timeKey] = newValue;
        }
        return {
          ...medication,
          schedule: {
            ...medication.schedule,
            times
          }
        };
      })
    }));
  }, []);

  return {
    importData,
    isSubmitting,
    error,
    addMedication,
    updateMedication,
    removeMedication,
    goToPreview,
    goToDataInput,
    submitImport,
    updateAllTimes
  };
} 