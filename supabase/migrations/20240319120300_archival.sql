-- Migration: Archival functionality
-- Description: Creates tables and functions for archiving old records
-- Author: System
-- Date: 2024-03-19

-- Create adherence_records_archive table
create table adherence_records_archive (
    id uuid primary key,
    user_id uuid not null,
    medication_id uuid not null,
    schedule_id uuid not null,
    scheduled_time timestamptz not null,
    taken_time timestamptz,
    status adherence_status not null,
    skip_reason_id uuid,
    skip_reason_custom text,
    dose_amount decimal(8,3),
    response_time_seconds integer,
    notes text,
    created_at timestamptz not null,
    archive_date date not null
);

comment on table adherence_records_archive is 'Archive of old adherence records';

-- Enable RLS
alter table adherence_records_archive enable row level security;

-- Create policies
create policy "users can view their archived adherence records" on adherence_records_archive
    for select using (auth.uid() = user_id);

-- Create indexes for archive table
create index idx_adherence_records_archive_user_id on adherence_records_archive(user_id);
create index idx_adherence_records_archive_medication_id on adherence_records_archive(medication_id);
create index idx_adherence_records_archive_schedule_id on adherence_records_archive(schedule_id);
create index idx_adherence_records_archive_scheduled_time on adherence_records_archive(scheduled_time);
create index idx_adherence_records_archive_archive_date on adherence_records_archive(archive_date);

-- Create archival function
create or replace function archive_old_adherence_records(cutoff_interval interval)
returns integer as $$
declare
    archived_count integer;
begin
    -- Insert records into archive
    insert into adherence_records_archive
    select 
        ar.*,
        current_date as archive_date
    from adherence_records ar
    where ar.scheduled_time < (current_timestamp - cutoff_interval);

    get diagnostics archived_count = row_count;

    -- Delete archived records from main table
    delete from adherence_records
    where scheduled_time < (current_timestamp - cutoff_interval);

    return archived_count;
end;
$$ language plpgsql security definer;

comment on function archive_old_adherence_records(interval) is 'Archives adherence records older than the specified interval';

-- Create helper function to get archived records count
create or replace function get_archived_records_count(p_user_id uuid)
returns table (
    total_archived bigint,
    archived_by_month json
) as $$
begin
    return query
    select 
        count(*)::bigint as total_archived,
        json_agg(monthly_counts) as archived_by_month
    from (
        select 
            date_trunc('month', archive_date) as month,
            count(*) as count
        from adherence_records_archive
        where user_id = p_user_id
        group by date_trunc('month', archive_date)
        order by date_trunc('month', archive_date) desc
    ) as monthly_counts;
end;
$$ language plpgsql security definer;

comment on function get_archived_records_count(uuid) is 'Returns statistics about archived records for a user';

-- Create function to restore archived records
create or replace function restore_archived_records(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
) returns integer as $$
declare
    restored_count integer;
begin
    -- Insert records back into main table
    insert into adherence_records
    select 
        id,
        user_id,
        medication_id,
        schedule_id,
        scheduled_time,
        taken_time,
        status,
        skip_reason_id,
        skip_reason_custom,
        dose_amount,
        response_time_seconds,
        notes,
        created_at
    from adherence_records_archive
    where user_id = p_user_id
    and archive_date between p_start_date and p_end_date;

    get diagnostics restored_count = row_count;

    -- Delete restored records from archive
    delete from adherence_records_archive
    where user_id = p_user_id
    and archive_date between p_start_date and p_end_date;

    return restored_count;
end;
$$ language plpgsql security definer;

comment on function restore_archived_records(uuid, date, date) is 'Restores archived records for a user within the specified date range';

-- Create a secure view to show archival statistics
create or replace view v_archival_statistics with (security_barrier) as
select
    user_id,
    count(*) as total_records,
    min(archive_date) as oldest_archive_date,
    max(archive_date) as newest_archive_date,
    count(distinct medication_id) as unique_medications,
    count(distinct schedule_id) as unique_schedules
from adherence_records_archive
where user_id = auth.uid()  -- Apply row-level security directly in the view
group by user_id;

comment on view v_archival_statistics is 'Summary statistics of archived records by user'; 