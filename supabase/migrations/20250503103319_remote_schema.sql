drop policy "Users can delete their own adherence records" on "public"."adherence_records";

drop policy "Users can insert their own adherence records" on "public"."adherence_records";

drop policy "Users can update their own adherence records" on "public"."adherence_records";

drop policy "Users can view their own adherence records" on "public"."adherence_records";

drop policy "Users can view their own archived records" on "public"."adherence_records_archive";

drop policy "Users can insert adherence report medications" on "public"."adherence_report_medications";

drop policy "Users can view their own adherence report medications" on "public"."adherence_report_medications";

drop policy "Users can create their own adherence reports" on "public"."adherence_reports";

drop policy "Users can view their own adherence reports" on "public"."adherence_reports";

drop policy "Anyone can view measurement units" on "public"."measurement_units";

drop policy "Anyone can view medication categories" on "public"."medication_categories";

drop policy "Users can manage their medication escalation rules" on "public"."medication_escalation_rules";

drop policy "Users can view their medication escalation rules" on "public"."medication_escalation_rules";

drop policy "Users can view medication interactions" on "public"."medication_interactions";

drop policy "Users can manage their medication photos" on "public"."medication_photos";

drop policy "Users can view their medication photos" on "public"."medication_photos";

drop policy "Users can manage their medication schedules" on "public"."medication_schedules";

drop policy "Users can view their medication schedules" on "public"."medication_schedules";

drop policy "Users can manage their medications" on "public"."medications";

drop policy "Users can view their medications" on "public"."medications";

drop policy "Users can manage their notification effectiveness" on "public"."notification_effectiveness";

drop policy "Users can view their notification effectiveness" on "public"."notification_effectiveness";

drop policy "Users can manage their notifications" on "public"."notifications";

drop policy "Users can view their notifications" on "public"."notifications";

drop policy "Anyone can view skip reasons" on "public"."skip_reasons";

drop policy "Users can manage their engagement data" on "public"."user_engagement";

drop policy "Users can view their engagement data" on "public"."user_engagement";

drop policy "Users can manage their notification preferences" on "public"."user_notification_preferences";

drop policy "Users can view their notification preferences" on "public"."user_notification_preferences";

drop policy "Users can manage their profile" on "public"."user_profiles";

drop policy "Users can view their profile" on "public"."user_profiles";

drop policy "Users can manage their usage tracking" on "public"."user_usage_tracking";

drop policy "Users can view their usage tracking" on "public"."user_usage_tracking";

alter table "public"."adherence_records" disable row level security;

alter table "public"."adherence_records_archive" disable row level security;

alter table "public"."adherence_report_medications" disable row level security;

alter table "public"."adherence_reports" disable row level security;

alter table "public"."measurement_units" disable row level security;

alter table "public"."medication_categories" disable row level security;

alter table "public"."medication_escalation_rules" disable row level security;

alter table "public"."medication_interactions" disable row level security;

alter table "public"."medication_photos" disable row level security;

alter table "public"."medication_schedules" disable row level security;

alter table "public"."medications" disable row level security;

alter table "public"."notification_effectiveness" disable row level security;

alter table "public"."notifications" disable row level security;

alter table "public"."skip_reasons" disable row level security;

alter table "public"."user_engagement" disable row level security;

alter table "public"."user_notification_preferences" disable row level security;

alter table "public"."user_profiles" disable row level security;

alter table "public"."user_usage_tracking" disable row level security;


