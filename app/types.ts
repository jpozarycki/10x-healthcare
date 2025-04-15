import { Database } from './db/database.types'

// Utility types
type Pagination = {
  page: number
  limit: number
  total: number
}

// Base types from database
type DBTables = Database['public']['Tables']
type DBEnums = Database['public']['Enums']

// Enums
export enum InteractionSeverity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high'
}

// User Profile DTOs
export type GetProfileResponse = Pick<
  DBTables['user_profiles']['Row'],
  | 'id'
  | 'first_name'
  | 'last_name'
  | 'age'
  | 'gender'
  | 'weight'
  | 'weight_unit'
  | 'health_conditions'
  | 'allergies'
  | 'timezone'
>

export type UpdateProfileRequest = Omit<
  GetProfileResponse,
  'id'
>

// Medication DTOs
export type MedicationListItem = Pick<
  DBTables['medications']['Row'],
  | 'id'
  | 'name'
  | 'form'
  | 'strength'
  | 'category'
  | 'is_active'
  | 'start_date'
  | 'end_date'
  | 'refill_reminder_days'
>

export type ListMedicationsResponse = {
  items: MedicationListItem[]
} & Pagination

export type SchedulePattern = {
  type: string
  pattern: Record<string, unknown>
  times: string[]
  with_food: boolean
}

export type CreateMedicationRequest = {
  name: string
  form: string
  strength?: string
  strength_unit_id?: string
  category: DBEnums['medication_category']
  purpose?: string
  instructions?: string
  start_date: string
  end_date?: string
  refill_reminder_days?: number
  pills_per_refill?: number
  schedule: SchedulePattern
}

export type MedicationDetailResponse = MedicationListItem & {
  purpose?: string
  instructions?: string
  pills_per_refill?: number
  pills_remaining?: number
  schedules: DBTables['medication_schedules']['Row'][]
}

export type ValidateMedicationInteractionsRequest = {
  medications: Array<{
    id: string
    name: string
    strength: string
    form: string
  }>
  new_medication: {
    name: string
    strength: string
    form: string
  }
  user_context: {
    health_conditions: string[]
    allergies: string[]
    age: number
  }
}

export type MedicationInteraction = {
  medication_pair: [string, string]
  description: string
  severity: InteractionSeverity
  recommendations: string
  confidence_score: number
}

export type ValidateMedicationInteractionsResponse = {
  has_interactions: boolean
  severity_level: InteractionSeverity
  interactions: MedicationInteraction[]
  disclaimer: string
  model_version: string
  generated_at: string
}

// Schedule DTOs
export type ScheduleListItem = Pick<
  DBTables['medication_schedules']['Row'],
  | 'id'
  | 'schedule_type'
  | 'schedule_pattern'
  | 'dose_amount'
  | 'dose_unit_id'
  | 'with_food'
  | 'start_date'
  | 'end_date'
>

export type ListSchedulesResponse = {
  items: ScheduleListItem[]
}

export type CreateScheduleRequest = Omit<
  ScheduleListItem,
  'id'
>

// Adherence DTOs
export type RecordDoseRequest = {
  medication_id: string
  schedule_id: string
  status: DBEnums['adherence_status']
  taken_time?: string
  skip_reason_id?: string
  skip_reason_custom?: string
}

export type MedicationAdherenceStats = {
  medication_id: string
  name: string
  adherence_rate: number
  doses_taken: number
  doses_missed: number
}

export type GetAdherenceStatsResponse = {
  overall_rate: number
  by_medication: MedicationAdherenceStats[]
  trends: {
    weekly: number[]
    monthly: number[]
  }
}

// Notification DTOs
export type NotificationItem = {
  id: string
  type: string
  message: string
  scheduled_time: string
  medication: {
    id: string
    name: string
  }
}

export type ListNotificationsResponse = {
  items: NotificationItem[]
  total: number
}

export type UpdateNotificationRequest = {
  is_read: boolean
  response_action?: string
}

// Report DTOs
export type GenerateReportRequest = {
  start_date: string
  end_date: string
  report_type: string
  medications: string[]
}

export type GenerateReportResponse = {
  report_id: string
  status: 'processing'
} 