import { MedicationListItem } from "../types";
import { Database } from "../db/database.types";
import { z } from 'zod';

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

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'as_needed';
export type MedicationCategory = 'chronic' | 'acute' | 'as_needed';

export interface SchedulePattern {
  days?: Record<string, boolean>;
  times?: string[];
  with_food?: boolean;
}

export interface MedicationSchedule {
  type: ScheduleType;
  pattern: SchedulePattern;
  times: string[];
  with_food: boolean;
}

export const medicationFormSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  form: z.string().min(1, "Medication form is required"),
  strength: z.string().optional(),
  category: z.enum(["chronic", "acute", "as_needed"] as const),
  purpose: z.string().optional(),
  instructions: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  refill_reminder_days: z.number().min(0).max(90).optional(),
  pills_per_refill: z.number().min(1).optional(),
  schedule: z.object({
    type: z.enum(["daily", "weekly", "monthly", "as_needed"] as const),
    pattern: z.object({
      days: z.record(z.boolean()).optional(),
      times: z.array(z.string()).optional(),
      with_food: z.boolean().optional()
    }),
    times: z.array(z.string()),
    with_food: z.boolean()
  })
});

export type MedicationFormData = z.infer<typeof medicationFormSchema>;

export interface MedicationInteraction {
  medication_pair: [string, string];
  description: string;
  severity: "LOW" | "MODERATE" | "HIGH";
  recommendations: string;
}

export interface MedicationApiResponse {
  data: MedicationFormData;
  interactions?: MedicationInteraction[];
  severity?: string;
  disclaimer?: string;
}

export interface MedicationResponse extends MedicationFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface MedicationError {
  path: string[];
  message: string;
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