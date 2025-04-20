import { MedicationListItem } from "../types";
import { Database } from "../db/database.types";

// Typy dla filtrów
export type MedicationFiltersViewModel = {
  category?: 'chronic' | 'acute' | 'as_needed';
  status?: 'active' | 'inactive';
  sort?: 'id' | 'name' | 'form' | 'start_date' | 'end_date';
  order?: 'asc' | 'desc';
}

// Typy dla formularza leków
export type MedicationFormViewModel = {
  id?: string;
  name: string;
  form: string;
  strength?: string;
  strengthUnitId?: string;
  category: Database['public']['Enums']['medication_category'];
  purpose?: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
  refillReminderDays?: number;
  pillsPerRefill?: number;
  scheduleType: string;
  scheduleTimes: string[];
  schedulePattern: Record<string, unknown>;
  withFood: boolean;
  errors: Record<string, string>;
  isValid: boolean;
}

// Typy dla masowego importu
export interface Medication {
  id: string;
  name: string;
  form: string;
  strength?: string;
  category: "chronic" | "acute" | "as_needed";
  startDate: string;
  endDate?: string;
  schedule: {
    type: string;
    times: string[];
    withFood: boolean;
    pattern?: Record<string, unknown>;
  };
  reminders?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkImportMedicationItem {
  id: string;
  name: string;
  form: string;
  strength?: string;
  category: "chronic" | "acute" | "as_needed";
  startDate: string;
  schedule: {
    type: "daily" | "weekly" | "monthly" | "as_needed";
    times: string[];
    withFood: boolean;
    pattern?: Record<string, unknown>;
  };
  errors?: Record<string, string>;
}

export interface MedicationFormData {
  name: string;
  form: string;
  strength?: string;
  category: "chronic" | "acute" | "as_needed";
  startDate: string;
  endDate?: string;
  schedule: {
    type: string;
    times: string[];
    withFood: boolean;
    pattern?: Record<string, unknown>;
  };
  reminders?: boolean;
  notes?: string;
}

export type BulkImportViewModel = {
  medications: BulkImportMedicationItem[];
  step: 'data_input' | 'calendar_preview';
  hasErrors: boolean;
}

// Typy dla szczegółów leku
export type MedicationDetailsViewModel = {
  details: MedicationListItem | null;
  isLoading: boolean;
  error: string | null;
}

// Typy dla paginacji
export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
} 