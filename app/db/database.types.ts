export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      adherence_records: {
        Row: {
          created_at: string
          dose_amount: number | null
          id: string
          medication_id: string
          notes: string | null
          response_time_seconds: number | null
          schedule_id: string
          scheduled_time: string
          skip_reason_custom: string | null
          skip_reason_id: string | null
          status: Database["public"]["Enums"]["adherence_status"]
          taken_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dose_amount?: number | null
          id?: string
          medication_id: string
          notes?: string | null
          response_time_seconds?: number | null
          schedule_id: string
          scheduled_time: string
          skip_reason_custom?: string | null
          skip_reason_id?: string | null
          status: Database["public"]["Enums"]["adherence_status"]
          taken_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dose_amount?: number | null
          id?: string
          medication_id?: string
          notes?: string | null
          response_time_seconds?: number | null
          schedule_id?: string
          scheduled_time?: string
          skip_reason_custom?: string | null
          skip_reason_id?: string | null
          status?: Database["public"]["Enums"]["adherence_status"]
          taken_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adherence_records_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adherence_records_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "medication_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adherence_records_skip_reason_id_fkey"
            columns: ["skip_reason_id"]
            isOneToOne: false
            referencedRelation: "skip_reasons"
            referencedColumns: ["id"]
          },
        ]
      }
      adherence_records_archive: {
        Row: {
          archive_date: string
          created_at: string
          dose_amount: number | null
          id: string
          medication_id: string
          notes: string | null
          response_time_seconds: number | null
          schedule_id: string
          scheduled_time: string
          skip_reason_custom: string | null
          skip_reason_id: string | null
          status: Database["public"]["Enums"]["adherence_status"]
          taken_time: string | null
          user_id: string
        }
        Insert: {
          archive_date: string
          created_at: string
          dose_amount?: number | null
          id: string
          medication_id: string
          notes?: string | null
          response_time_seconds?: number | null
          schedule_id: string
          scheduled_time: string
          skip_reason_custom?: string | null
          skip_reason_id?: string | null
          status: Database["public"]["Enums"]["adherence_status"]
          taken_time?: string | null
          user_id: string
        }
        Update: {
          archive_date?: string
          created_at?: string
          dose_amount?: number | null
          id?: string
          medication_id?: string
          notes?: string | null
          response_time_seconds?: number | null
          schedule_id?: string
          scheduled_time?: string
          skip_reason_custom?: string | null
          skip_reason_id?: string | null
          status?: Database["public"]["Enums"]["adherence_status"]
          taken_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      adherence_report_medications: {
        Row: {
          adherence_rate: number
          average_delay_minutes: number | null
          created_at: string
          doses_missed: number
          doses_scheduled: number
          doses_taken: number
          id: string
          medication_id: string
          report_id: string
        }
        Insert: {
          adherence_rate: number
          average_delay_minutes?: number | null
          created_at?: string
          doses_missed: number
          doses_scheduled: number
          doses_taken: number
          id?: string
          medication_id: string
          report_id: string
        }
        Update: {
          adherence_rate?: number
          average_delay_minutes?: number | null
          created_at?: string
          doses_missed?: number
          doses_scheduled?: number
          doses_taken?: number
          id?: string
          medication_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adherence_report_medications_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adherence_report_medications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "adherence_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      adherence_reports: {
        Row: {
          created_at: string
          end_date: string
          id: string
          insights: Json | null
          overall_adherence_rate: number | null
          report_data: Json
          report_type: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          insights?: Json | null
          overall_adherence_rate?: number | null
          report_data: Json
          report_type: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          insights?: Json | null
          overall_adherence_rate?: number | null
          report_data?: Json
          report_type?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      measurement_units: {
        Row: {
          abbreviation: string
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          abbreviation: string
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      medication_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      medication_escalation_rules: {
        Row: {
          created_at: string
          delay_minutes: number
          enabled: boolean | null
          escalation_step: number
          id: string
          medication_id: string
          message_type: string
          priority_level: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delay_minutes: number
          enabled?: boolean | null
          escalation_step: number
          id?: string
          medication_id: string
          message_type: string
          priority_level?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delay_minutes?: number
          enabled?: boolean | null
          escalation_step?: number
          id?: string
          medication_id?: string
          message_type?: string
          priority_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_escalation_rules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_interactions: {
        Row: {
          created_at: string
          data_source: string
          id: string
          interaction_description: string
          interaction_level: string
          medication_id_1: string
          medication_id_2: string
          reference_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_source: string
          id?: string
          interaction_description: string
          interaction_level: string
          medication_id_1: string
          medication_id_2: string
          reference_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_source?: string
          id?: string
          interaction_description?: string
          interaction_level?: string
          medication_id_1?: string
          medication_id_2?: string
          reference_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_interactions_medication_id_1_fkey"
            columns: ["medication_id_1"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_interactions_medication_id_2_fkey"
            columns: ["medication_id_2"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_photos: {
        Row: {
          content_type: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          medication_id: string
          original_filename: string | null
          recognition_data: Json | null
          recognition_status: string | null
          s3_key: string
          size_bytes: number | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          medication_id: string
          original_filename?: string | null
          recognition_data?: Json | null
          recognition_status?: string | null
          s3_key: string
          size_bytes?: number | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          medication_id?: string
          original_filename?: string | null
          recognition_data?: Json | null
          recognition_status?: string | null
          s3_key?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_photos_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_schedules: {
        Row: {
          created_at: string
          dose_amount: number
          dose_unit_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          medication_id: string
          schedule_pattern: Json
          schedule_type: string
          special_instructions: string | null
          start_date: string
          updated_at: string
          with_food: boolean | null
          with_water: boolean | null
        }
        Insert: {
          created_at?: string
          dose_amount: number
          dose_unit_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          medication_id: string
          schedule_pattern: Json
          schedule_type: string
          special_instructions?: string | null
          start_date: string
          updated_at?: string
          with_food?: boolean | null
          with_water?: boolean | null
        }
        Update: {
          created_at?: string
          dose_amount?: number
          dose_unit_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          medication_id?: string
          schedule_pattern?: Json
          schedule_type?: string
          special_instructions?: string | null
          start_date?: string
          updated_at?: string
          with_food?: boolean | null
          with_water?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_schedules_dose_unit_id_fkey"
            columns: ["dose_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_schedules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          category: Database["public"]["Enums"]["medication_category"]
          created_at: string
          end_date: string | null
          form: string
          id: string
          instructions: string | null
          is_active: boolean | null
          last_refill_date: string | null
          name: string
          notes: string | null
          pharmacy: string | null
          pills_per_refill: number | null
          pills_remaining: number | null
          prescribing_doctor: string | null
          prescription_number: string | null
          purpose: string | null
          refill_reminder_days: number | null
          start_date: string
          strength: string | null
          strength_unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["medication_category"]
          created_at?: string
          end_date?: string | null
          form: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          last_refill_date?: string | null
          name: string
          notes?: string | null
          pharmacy?: string | null
          pills_per_refill?: number | null
          pills_remaining?: number | null
          prescribing_doctor?: string | null
          prescription_number?: string | null
          purpose?: string | null
          refill_reminder_days?: number | null
          start_date: string
          strength?: string | null
          strength_unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["medication_category"]
          created_at?: string
          end_date?: string | null
          form?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          last_refill_date?: string | null
          name?: string
          notes?: string | null
          pharmacy?: string | null
          pills_per_refill?: number | null
          pills_remaining?: number | null
          prescribing_doctor?: string | null
          prescription_number?: string | null
          purpose?: string | null
          refill_reminder_days?: number | null
          start_date?: string
          strength?: string | null
          strength_unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_strength_unit_id_fkey"
            columns: ["strength_unit_id"]
            isOneToOne: false
            referencedRelation: "measurement_units"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_effectiveness: {
        Row: {
          created_at: string
          id: string
          message_style: string | null
          notification_id: string
          notification_variant: string | null
          response_time_seconds: number | null
          user_id: string
          was_effective: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_style?: string | null
          notification_id: string
          notification_variant?: string | null
          response_time_seconds?: number | null
          user_id: string
          was_effective?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          message_style?: string | null
          notification_id?: string
          notification_variant?: string | null
          response_time_seconds?: number | null
          user_id?: string
          was_effective?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_effectiveness_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          adherence_record_id: string | null
          channel: string
          created_at: string
          escalation_level: number | null
          id: string
          is_read: boolean | null
          medication_id: string | null
          message: string
          notification_type: string
          read_time: string | null
          response_action: string | null
          response_time: string | null
          schedule_id: string | null
          scheduled_time: string
          sent_time: string | null
          user_id: string
        }
        Insert: {
          adherence_record_id?: string | null
          channel: string
          created_at?: string
          escalation_level?: number | null
          id?: string
          is_read?: boolean | null
          medication_id?: string | null
          message: string
          notification_type: string
          read_time?: string | null
          response_action?: string | null
          response_time?: string | null
          schedule_id?: string | null
          scheduled_time: string
          sent_time?: string | null
          user_id: string
        }
        Update: {
          adherence_record_id?: string | null
          channel?: string
          created_at?: string
          escalation_level?: number | null
          id?: string
          is_read?: boolean | null
          medication_id?: string | null
          message?: string
          notification_type?: string
          read_time?: string | null
          response_action?: string | null
          response_time?: string | null
          schedule_id?: string | null
          scheduled_time?: string
          sent_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_adherence_record_id_fkey"
            columns: ["adherence_record_id"]
            isOneToOne: false
            referencedRelation: "adherence_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "medication_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      skip_reasons: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_common: boolean | null
          reason: string
          requires_followup: boolean | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_common?: boolean | null
          reason: string
          requires_followup?: boolean | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_common?: boolean | null
          reason?: string
          requires_followup?: boolean | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          adherence_dashboard_views: number | null
          app_opens: number | null
          created_at: string
          date: string
          education_content_views: number | null
          id: string
          reminders_received: number | null
          reminders_responded: number | null
          total_session_duration_seconds: number | null
          user_id: string
        }
        Insert: {
          adherence_dashboard_views?: number | null
          app_opens?: number | null
          created_at?: string
          date: string
          education_content_views?: number | null
          id?: string
          reminders_received?: number | null
          reminders_responded?: number | null
          total_session_duration_seconds?: number | null
          user_id: string
        }
        Update: {
          adherence_dashboard_views?: number | null
          app_opens?: number | null
          created_at?: string
          date?: string
          education_content_views?: number | null
          id?: string
          reminders_received?: number | null
          reminders_responded?: number | null
          total_session_duration_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          communication_style: string | null
          created_at: string
          daily_summary_time: string | null
          enable_email: boolean | null
          enable_push: boolean | null
          enable_sms: boolean | null
          id: string
          language: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_channels: string[]
          updated_at: string
          user_id: string
          weekly_report_day: number | null
          weekly_report_time: string | null
        }
        Insert: {
          communication_style?: string | null
          created_at?: string
          daily_summary_time?: string | null
          enable_email?: boolean | null
          enable_push?: boolean | null
          enable_sms?: boolean | null
          id?: string
          language?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_channels?: string[]
          updated_at?: string
          user_id: string
          weekly_report_day?: number | null
          weekly_report_time?: string | null
        }
        Update: {
          communication_style?: string | null
          created_at?: string
          daily_summary_time?: string | null
          enable_email?: boolean | null
          enable_push?: boolean | null
          enable_sms?: boolean | null
          id?: string
          language?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_channels?: string[]
          updated_at?: string
          user_id?: string
          weekly_report_day?: number | null
          weekly_report_time?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: Json | null
          created_at: string
          first_name: string | null
          gender: string | null
          health_conditions: Json | null
          health_literacy_level: string | null
          id: string
          last_name: string | null
          timezone: string
          updated_at: string
          user_id: string
          weight: number | null
          weight_unit: string | null
          work_type: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: Json | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          health_conditions?: Json | null
          health_literacy_level?: string | null
          id?: string
          last_name?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
          weight?: number | null
          weight_unit?: string | null
          work_type?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: Json | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          health_conditions?: Json | null
          health_literacy_level?: string | null
          id?: string
          last_name?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
          weight_unit?: string | null
          work_type?: string | null
        }
        Relationships: []
      }
      user_usage_tracking: {
        Row: {
          app_version: string | null
          created_at: string
          device_type: string | null
          feature_usage: Json | null
          id: string
          last_active_date: string | null
          onboarding_completed: boolean | null
          session_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_type?: string | null
          feature_usage?: Json | null
          id?: string
          last_active_date?: string | null
          onboarding_completed?: boolean | null
          session_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_type?: string | null
          feature_usage?: Json | null
          id?: string
          last_active_date?: string | null
          onboarding_completed?: boolean | null
          session_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_user_weekly_adherence: {
        Row: {
          adherence_rate: number | null
          avg_delay_minutes: number | null
          doses_missed: number | null
          doses_skipped: number | null
          doses_taken: number | null
          medication_id: string | null
          total_doses: number | null
          user_id: string | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adherence_records_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      v_archival_statistics: {
        Row: {
          newest_archive_date: string | null
          oldest_archive_date: string | null
          total_records: number | null
          unique_medications: number | null
          unique_schedules: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_old_adherence_records: {
        Args: { cutoff_interval: unknown }
        Returns: number
      }
      delete_adherence_records_with_refresh: {
        Args: { 
          p_medication_id: string
          p_user_id: string 
        }
        Returns: void
      }
      delete_medication_adherence_records: {
        Args: { 
          p_medication_id: string
          p_user_id: string 
        }
        Returns: void
      }
      get_archived_records_count: {
        Args: { p_user_id: string }
        Returns: {
          total_archived: number
          archived_by_month: Json
        }[]
      }
      restore_archived_records: {
        Args: { p_user_id: string; p_start_date: string; p_end_date: string }
        Returns: number
      }
    }
    Enums: {
      adherence_status: "taken" | "missed" | "skipped" | "pending"
      medication_category: "chronic" | "acute" | "as_needed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      adherence_status: ["taken", "missed", "skipped", "pending"],
      medication_category: ["chronic", "acute", "as_needed"],
    },
  },
} as const

