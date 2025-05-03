-- Migration: Add Row Level Security (RLS) policies to all tables
-- Description: This migration enables RLS on all tables and adds appropriate policies for data access
-- Author: System
-- Date: 2024-05-03

-- Enable RLS on all tables
alter table adherence_records enable row level security;
alter table adherence_records_archive enable row level security;
alter table adherence_report_medications enable row level security;
alter table adherence_reports enable row level security;
alter table measurement_units enable row level security;
alter table medication_categories enable row level security;
alter table medication_escalation_rules enable row level security;
alter table medication_interactions enable row level security;
alter table medication_photos enable row level security;
alter table medication_schedules enable row level security;
alter table medications enable row level security;
alter table notification_effectiveness enable row level security;
alter table notifications enable row level security;
alter table skip_reasons enable row level security;
alter table user_engagement enable row level security;
alter table user_notification_preferences enable row level security;
alter table user_profiles enable row level security;
alter table user_usage_tracking enable row level security;

-- Adherence Records Policies
create policy "Users can view their own adherence records"
  on adherence_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own adherence records"
  on adherence_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own adherence records"
  on adherence_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own adherence records"
  on adherence_records for delete
  using (auth.uid() = user_id);

-- Adherence Records Archive Policies
create policy "Users can view their own archived records"
  on adherence_records_archive for select
  using (auth.uid() = user_id);

-- Adherence Report Medications Policies
create policy "Users can view their own adherence report medications"
  on adherence_report_medications for select
  using (exists (
    select 1 from adherence_reports ar
    where ar.id = report_id
    and ar.user_id = auth.uid()
  ));

create policy "Users can insert adherence report medications"
  on adherence_report_medications for insert
  with check (exists (
    select 1 from adherence_reports ar
    where ar.id = report_id
    and ar.user_id = auth.uid()
  ));

-- Adherence Reports Policies
create policy "Users can view their own adherence reports"
  on adherence_reports for select
  using (auth.uid() = user_id);

create policy "Users can create their own adherence reports"
  on adherence_reports for insert
  with check (auth.uid() = user_id);

-- Measurement Units Policies (Public Read-only access)
create policy "Anyone can view measurement units"
  on measurement_units for select
  using (true);

-- Medication Categories Policies (Public Read-only access)
create policy "Anyone can view medication categories"
  on medication_categories for select
  using (true);

-- Medication Escalation Rules Policies
create policy "Users can view their medication escalation rules"
  on medication_escalation_rules for select
  using (exists (
    select 1 from medications m
    where m.id = medication_id
    and m.user_id = auth.uid()
  ));

create policy "Users can manage their medication escalation rules"
  on medication_escalation_rules for all
  using (exists (
    select 1 from medications m
    where m.id = medication_id
    and m.user_id = auth.uid()
  ));

-- Medication Interactions Policies
create policy "Users can view medication interactions"
  on medication_interactions for select
  using (exists (
    select 1 from medications m
    where (m.id = medication_id_1 or m.id = medication_id_2)
    and m.user_id = auth.uid()
  ));

-- Medication Photos Policies
create policy "Users can view their medication photos"
  on medication_photos for select
  using (exists (
    select 1 from medications m
    where m.id = medication_id
    and m.user_id = auth.uid()
  ));

create policy "Users can manage their medication photos"
  on medication_photos for all
  using (exists (
    select 1 from medications m
    where m.id = medication_id
    and m.user_id = auth.uid()
  ));

-- Medication Schedules Policies
create policy "Users can view their medication schedules"
  on medication_schedules for select
  using (exists (
    select 1 from medications m
    where m.id = medication_id
    and m.user_id = auth.uid()
  ));

create policy "Users can manage their medication schedules"
  on medication_schedules for all
  using (exists (
    select 1 from medications m
    where m.id = medication_id
    and m.user_id = auth.uid()
  ));

-- Medications Policies
create policy "Users can view their medications"
  on medications for select
  using (auth.uid() = user_id);

create policy "Users can manage their medications"
  on medications for all
  using (auth.uid() = user_id);

-- Notification Effectiveness Policies
create policy "Users can view their notification effectiveness"
  on notification_effectiveness for select
  using (auth.uid() = user_id);

create policy "Users can manage their notification effectiveness"
  on notification_effectiveness for all
  using (auth.uid() = user_id);

-- Notifications Policies
create policy "Users can view their notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can manage their notifications"
  on notifications for all
  using (auth.uid() = user_id);

-- Skip Reasons Policies (Public Read-only access)
create policy "Anyone can view skip reasons"
  on skip_reasons for select
  using (true);

-- User Engagement Policies
create policy "Users can view their engagement data"
  on user_engagement for select
  using (auth.uid() = user_id);

create policy "Users can manage their engagement data"
  on user_engagement for all
  using (auth.uid() = user_id);

-- User Notification Preferences Policies
create policy "Users can view their notification preferences"
  on user_notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can manage their notification preferences"
  on user_notification_preferences for all
  using (auth.uid() = user_id);

-- User Profiles Policies
create policy "Users can view their profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can manage their profile"
  on user_profiles for all
  using (auth.uid() = user_id);

-- User Usage Tracking Policies
create policy "Users can view their usage tracking"
  on user_usage_tracking for select
  using (auth.uid() = user_id);

create policy "Users can manage their usage tracking"
  on user_usage_tracking for all
  using (auth.uid() = user_id); 