-- Migration: Adherence tracking and analytics
-- Description: Creates tables for tracking medication adherence and generating analytics
-- Author: System
-- Date: 2024-03-19

-- Create skip_reasons table
create table skip_reasons (
    id uuid primary key default gen_random_uuid(),
    reason varchar(255) not null unique,
    is_common boolean default true,
    category varchar(50),
    requires_followup boolean default false,
    created_at timestamptz not null default now()
);

comment on table skip_reasons is 'Predefined reasons for skipping medication doses';

-- Enable RLS
alter table skip_reasons enable row level security;

-- Allow public read access to skip reasons
create policy "skip reasons are viewable by everyone" on skip_reasons
    for select using (true);

-- Create adherence_records table
create table adherence_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    medication_id uuid not null references medications(id),
    schedule_id uuid not null references medication_schedules(id),
    scheduled_time timestamptz not null,
    taken_time timestamptz,
    status adherence_status not null,
    skip_reason_id uuid references skip_reasons(id),
    skip_reason_custom text,
    dose_amount decimal(8,3),
    response_time_seconds integer,
    notes text,
    created_at timestamptz not null default now()
);

comment on table adherence_records is 'Records of medication doses taken or missed';

-- Enable RLS
alter table adherence_records enable row level security;

-- Create policies
create policy "users can view their adherence records" on adherence_records
    for select using (auth.uid() = user_id);

create policy "users can insert their adherence records" on adherence_records
    for insert with check (auth.uid() = user_id);

-- Create notifications table
create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    medication_id uuid references medications(id),
    schedule_id uuid references medication_schedules(id),
    adherence_record_id uuid references adherence_records(id),
    notification_type varchar(50) not null,
    scheduled_time timestamptz not null,
    sent_time timestamptz,
    message text not null,
    channel varchar(50) not null,
    escalation_level integer default 0,
    is_read boolean default false,
    read_time timestamptz,
    response_action varchar(50),
    response_time timestamptz,
    created_at timestamptz not null default now()
);

comment on table notifications is 'Medication reminders and other notifications sent to users';

-- Enable RLS
alter table notifications enable row level security;

-- Create policies
create policy "users can view their notifications" on notifications
    for select using (auth.uid() = user_id);

create policy "users can update their notifications" on notifications
    for update using (auth.uid() = user_id);

-- Create notification_effectiveness table
create table notification_effectiveness (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    notification_id uuid not null references notifications(id),
    was_effective boolean,
    response_time_seconds integer,
    notification_variant varchar(50),
    message_style varchar(50),
    created_at timestamptz not null default now()
);

comment on table notification_effectiveness is 'Tracks the effectiveness of different notification styles';

-- Enable RLS
alter table notification_effectiveness enable row level security;

-- Create policies
create policy "users can view their notification effectiveness data" on notification_effectiveness
    for select using (auth.uid() = user_id);

-- Create medication_interactions table
create table medication_interactions (
    id uuid primary key default gen_random_uuid(),
    medication_id_1 uuid not null references medications(id),
    medication_id_2 uuid not null references medications(id),
    interaction_level varchar(50) not null,
    interaction_description text not null,
    data_source varchar(255) not null,
    reference_url varchar(255),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table medication_interactions is 'Records potential interactions between medications';

-- Enable RLS
alter table medication_interactions enable row level security;

-- Create policies
create policy "users can view interactions for their medications" on medication_interactions
    for select using (
        exists (
            select 1 from medications
            where (medications.id = medication_interactions.medication_id_1
                  or medications.id = medication_interactions.medication_id_2)
            and medications.user_id = auth.uid()
        )
    );

-- Create adherence_reports table
create table adherence_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    report_type varchar(50) not null,
    start_date date not null,
    end_date date not null,
    overall_adherence_rate decimal(5,2),
    report_data jsonb not null,
    insights jsonb,
    created_at timestamptz not null default now()
);

comment on table adherence_reports is 'Generated adherence reports for users';

-- Enable RLS
alter table adherence_reports enable row level security;

-- Create policies
create policy "users can view their adherence reports" on adherence_reports
    for select using (auth.uid() = user_id);

-- Create adherence_report_medications table
create table adherence_report_medications (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null references adherence_reports(id) on delete cascade,
    medication_id uuid not null references medications(id),
    adherence_rate decimal(5,2) not null,
    doses_scheduled integer not null,
    doses_taken integer not null,
    doses_missed integer not null,
    average_delay_minutes decimal(10,2),
    created_at timestamptz not null default now()
);

comment on table adherence_report_medications is 'Detailed medication-specific adherence data for reports';

-- Enable RLS
alter table adherence_report_medications enable row level security;

-- Create policies
create policy "users can view their adherence report medications" on adherence_report_medications
    for select using (
        exists (
            select 1 from adherence_reports
            where adherence_reports.id = adherence_report_medications.report_id
            and adherence_reports.user_id = auth.uid()
        )
    );

-- Create user_engagement table
create table user_engagement (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    date date not null,
    app_opens integer default 0,
    total_session_duration_seconds integer default 0,
    education_content_views integer default 0,
    reminders_received integer default 0,
    reminders_responded integer default 0,
    adherence_dashboard_views integer default 0,
    created_at timestamptz not null default now()
);

comment on table user_engagement is 'Daily user engagement metrics';

-- Enable RLS
alter table user_engagement enable row level security;

-- Create policies
create policy "users can view their engagement data" on user_engagement
    for select using (auth.uid() = user_id);

create policy "users can update their engagement data" on user_engagement
    for update using (auth.uid() = user_id);

create policy "users can insert their engagement data" on user_engagement
    for insert with check (auth.uid() = user_id);

-- Create indexes
create index idx_adherence_records_user_id on adherence_records(user_id);
create index idx_adherence_records_medication_id on adherence_records(medication_id);
create index idx_adherence_records_schedule_id on adherence_records(schedule_id);
create index idx_adherence_records_scheduled_time on adherence_records(scheduled_time);
create index idx_adherence_records_status on adherence_records(status);
create index idx_adherence_records_scheduled_time_user_id on adherence_records(user_id, scheduled_time);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_scheduled_time on notifications(scheduled_time);
create index idx_notifications_medication_id on notifications(medication_id);
create index idx_notifications_scheduled_time_user_id on notifications(user_id, scheduled_time);

create index idx_adherence_reports_user_id on adherence_reports(user_id);
create index idx_adherence_reports_date_range on adherence_reports(user_id, start_date, end_date);

create index idx_user_engagement_user_id_date on user_engagement(user_id, date);

-- Add updated_at triggers
create trigger update_medication_interactions_updated_at
    before update on medication_interactions
    for each row
    execute function update_updated_at_column();

-- Create materialized view for weekly adherence
create materialized view mv_user_weekly_adherence as
select
    user_id,
    medication_id,
    date_trunc('week', scheduled_time) as week_start,
    count(*) as total_doses,
    sum(case when status = 'taken' then 1 else 0 end) as doses_taken,
    sum(case when status = 'missed' then 1 else 0 end) as doses_missed,
    sum(case when status = 'skipped' then 1 else 0 end) as doses_skipped,
    round((sum(case when status = 'taken' then 1 else 0 end)::numeric / count(*)::numeric) * 100, 2) as adherence_rate,
    avg(case when status = 'taken' and taken_time is not null 
        then extract(epoch from (taken_time - scheduled_time))/60 
        else null end) as avg_delay_minutes
from
    adherence_records
group by
    user_id, medication_id, date_trunc('week', scheduled_time);

comment on materialized view mv_user_weekly_adherence is 'Weekly adherence statistics for users and medications';

-- Create unique index on materialized view
create unique index idx_mv_user_weekly_adherence_pk on mv_user_weekly_adherence(user_id, medication_id, week_start);

-- Create function to refresh materialized view
create or replace function refresh_weekly_adherence()
returns trigger as $$
begin
    refresh materialized view concurrently mv_user_weekly_adherence;
    return null;
end;
$$ language plpgsql;

-- Create trigger to refresh materialized view
create trigger refresh_weekly_adherence_trigger
    after insert or update or delete
    on adherence_records
    for each statement
    execute function refresh_weekly_adherence(); 