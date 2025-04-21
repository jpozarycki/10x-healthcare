import { useState } from "react";
import { BulkImportMedicationItem } from "@/app/types/medications";
import { bulkImportMedications } from "@/lib/api/medications";

interface UseBulkImportReturn {
  medications: BulkImportMedicationItem[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  hasValidationErrors: boolean;
  totalMedications: number;
  successCount: number;
  failureCount: number;
  addMedication: (medication: BulkImportMedicationItem) => void;
  updateMedication: (id: string, medication: Partial<BulkImportMedicationItem>) => void;
  removeMedication: (id: string) => void;
  validateAllMedications: () => boolean;
  submitImport: () => Promise<void>;
  resetBulkImport: () => void;
  uploadFile: (file: File) => Promise<void>;
}

export function useBulkImport(): UseBulkImportReturn {
  const [medications, setMedications] = useState<BulkImportMedicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [totalMedications, setTotalMedications] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  
  // Dodaje nowy lek do listy
  const addMedication = (medication: BulkImportMedicationItem) => {
    setMedications(prev => [...prev, medication]);
  };
  
  // Aktualizuje istniejący lek
  const updateMedication = (id: string, medicationUpdate: Partial<BulkImportMedicationItem>) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id 
          ? { ...med, ...medicationUpdate } 
          : med
      )
    );
  };
  
  // Usuwa lek z listy
  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };
  
  // Waliduje wszystkie leki przed importem
  const validateAllMedications = () => {
    let allValid = true;
    
    const validatedMedications = medications.map(medication => {
      const errors: Record<string, string> = {};
      
      // Walidacja nazwy
      if (!medication.name.trim()) {
        errors.name = "Medication name is required";
        allValid = false;
      }
      
      // Walidacja formy
      if (!medication.form.trim()) {
        errors.form = "Medication form is required";
        allValid = false;
      }
      
      // Walidacja daty rozpoczęcia
      if (!medication.startDate) {
        errors.startDate = "Start date is required";
        allValid = false;
      }
      
      // Walidacja harmonogramu
      if (medication.schedule.type !== "as_needed" && (!medication.schedule.times || medication.schedule.times.length === 0)) {
        errors.schedule = "At least one time is required for this schedule type";
        allValid = false;
      }
      
      return {
        ...medication,
        errors
      };
    });
    
    setMedications(validatedMedications);
    return allValid;
  };
  
  // Resetuje cały stan importu
  const resetBulkImport = () => {
    setMedications([]);
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(false);
    setTotalMedications(0);
    setSuccessCount(0);
    setFailureCount(0);
  };
  
  // Wysyła leki do API
  const submitImport = async () => {
    if (medications.length === 0) return;
    
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setTotalMedications(medications.length);
    
    try {
      const results = await bulkImportMedications(
        medications.map(med => ({
          name: med.name,
          form: med.form,
          strength: med.strength || null,
          category: med.category,
          startDate: med.startDate,
          schedule: {
            ...med.schedule,
            withFood: false // Adding default value for withFood
          }
        }))
      );
      
      setSuccessCount(Array.isArray(results) ? results.length : 0);
      setFailureCount(medications.length - (Array.isArray(results) ? results.length : 0));
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit bulk import", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Parsuje plik CSV i dodaje leki do listy
  const uploadFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const lines = content.split('\n');
          
          // Pomijam nagłówek
          if (lines.length < 2) {
            reject(new Error("Invalid CSV format"));
            return;
          }
          
          const parsedMedications: BulkImportMedicationItem[] = [];
          
          // Parsowanie każdej linii
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length < 5) continue;
            
            const [name, form, strength, category, startDate, scheduleType, times] = parts;
            
            // Walidacja kategorii
            const validCategory = ["chronic", "acute", "as_needed"].includes(category) 
              ? category as "chronic" | "acute" | "as_needed" 
              : "chronic";
            
            // Walidacja typu harmonogramu
            const validScheduleType = ["daily", "weekly", "monthly", "as_needed"].includes(scheduleType)
              ? scheduleType as "daily" | "weekly" | "monthly" | "as_needed"
              : "daily";
            
            // Parsowanie czasów
            const timesList = times ? times.split(';').filter(t => t.trim()) : [];
            
            parsedMedications.push({
              id: `import-${i}-${Date.now()}`,
              name: name.trim(),
              form: form.trim(),
              strength: strength.trim(),
              category: validCategory,
              startDate: startDate.trim(),
              schedule: {
                type: validScheduleType,
                times: timesList.length > 0 ? timesList : ["08:00"],
                withFood: false // Adding default value for withFood
              },
              errors: {}
            });
          }
          
          if (parsedMedications.length === 0) {
            reject(new Error("No valid medications found in the file"));
            return;
          }
          
          setMedications(parsedMedications);
          resolve();
        } catch (error) {
          console.error("Error parsing CSV", error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsText(file);
    });
  };
  
  const hasValidationErrors = medications.some(med => 
    med.errors && Object.keys(med.errors).length > 0
  );
  
  return {
    medications,
    isLoading,
    isError,
    isSuccess,
    hasValidationErrors,
    totalMedications,
    successCount,
    failureCount,
    addMedication,
    updateMedication,
    removeMedication,
    validateAllMedications,
    submitImport,
    resetBulkImport,
    uploadFile
  };
} 