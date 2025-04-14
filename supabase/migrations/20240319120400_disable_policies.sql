-- Migration: Disable all RLS policies
-- Description: Drops all previously created RLS policies
-- Author: System
-- Date: 2024-03-19

-- Drop policies from initial_schema.sql
drop policy if exists "measurement_units are viewable by everyone" on measurement_units;
drop policy if exists "users can view their own profile" on user_profiles;
drop policy if exists "users can update their own profile" on user_profiles;
drop policy if exists "users can insert their own profile" on user_profiles;
drop policy if exists "users can view their own notification preferences" on user_notification_preferences;
drop policy if exists "users can update their own notification preferences" on user_notification_preferences;
drop policy if exists "users can insert their own notification preferences" on user_notification_preferences;
drop policy if exists "users can view their own usage data" on user_usage_tracking;
drop policy if exists "users can update their own usage data" on user_usage_tracking;
drop policy if exists "users can insert their own usage data" on user_usage_tracking;

-- Drop policies from medications.sql
drop policy if exists "medication categories are viewable by everyone" on medication_categories;
drop policy if exists "users can view their own medications" on medications;
drop policy if exists "users can update their own medications" on medications;
drop policy if exists "users can insert their own medications" on medications;
drop policy if exists "users can delete their own medications" on medications;
drop policy if exists "users can view their medication schedules" on medication_schedules;
drop policy if exists "users can update their medication schedules" on medication_schedules;
drop policy if exists "users can insert their medication schedules" on medication_schedules;
drop policy if exists "users can delete their medication schedules" on medication_schedules;
drop policy if exists "users can view their medication photos" on medication_photos;
drop policy if exists "users can insert their medication photos" on medication_photos;
drop policy if exists "users can delete their medication photos" on medication_photos;
drop policy if exists "users can view their medication escalation rules" on medication_escalation_rules;
drop policy if exists "users can update their medication escalation rules" on medication_escalation_rules;
drop policy if exists "users can insert their medication escalation rules" on medication_escalation_rules;
drop policy if exists "users can delete their medication escalation rules" on medication_escalation_rules;

-- Drop policies from adherence_tracking.sql
drop policy if exists "skip reasons are viewable by everyone" on skip_reasons;
drop policy if exists "users can view their adherence records" on adherence_records;
drop policy if exists "users can insert their adherence records" on adherence_records;
drop policy if exists "users can view their notifications" on notifications;
drop policy if exists "users can update their notifications" on notifications;
drop policy if exists "users can view their notification effectiveness data" on notification_effectiveness;
drop policy if exists "users can view interactions for their medications" on medication_interactions;
drop policy if exists "users can view their adherence reports" on adherence_reports;
drop policy if exists "users can view their adherence report medications" on adherence_report_medications;
drop policy if exists "users can view their engagement data" on user_engagement;
drop policy if exists "users can update their engagement data" on user_engagement;
drop policy if exists "users can insert their engagement data" on user_engagement;

-- Drop policies from archival.sql
drop policy if exists "users can view their archived adherence records" on adherence_records_archive;

-- Disable RLS on all tables
alter table measurement_units disable row level security;
alter table user_profiles disable row level security;
alter table user_notification_preferences disable row level security;
alter table user_usage_tracking disable row level security;
alter table medication_categories disable row level security;
alter table medications disable row level security;
alter table medication_schedules disable row level security;
alter table medication_photos disable row level security;
alter table medication_escalation_rules disable row level security;
alter table skip_reasons disable row level security;
alter table adherence_records disable row level security;
alter table notifications disable row level security;
alter table notification_effectiveness disable row level security;
alter table medication_interactions disable row level security;
alter table adherence_reports disable row level security;
alter table adherence_report_medications disable row level security;
alter table user_engagement disable row level security;
alter table adherence_records_archive disable row level security; 