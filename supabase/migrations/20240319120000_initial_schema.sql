-- Migration: Initial schema setup for MedMinder Plus
-- Description: Creates core types and tables for user management
-- Author: System
-- Date: 2024-03-19

-- Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- Create custom types
create type medication_category as enum ('chronic', 'acute', 'as_needed');
create type adherence_status as enum ('taken', 'missed', 'skipped', 'pending');

-- Create measurement_units table first as it's referenced by other tables
create table measurement_units (
    id uuid primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    abbreviation varchar(10) not null unique,
    type varchar(50) not null,
    created_at timestamptz not null default now()
);

comment on table measurement_units is 'Stores standardized measurement units for medication dosages';

-- Enable RLS
alter table measurement_units enable row level security;

-- Allow public read access to measurement units
create policy "measurement_units are viewable by everyone" on measurement_units
    for select using (true);

-- Create user_profiles table
create table user_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    first_name varchar(100),
    last_name varchar(100),
    age integer,
    gender varchar(50),
    weight decimal(5,2),
    weight_unit varchar(10) default 'kg',
    activity_level varchar(50),
    work_type varchar(50),
    timezone varchar(50) not null default 'UTC',
    health_conditions jsonb,
    allergies jsonb,
    health_literacy_level varchar(20),
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

comment on table user_profiles is 'Stores extended profile information for authenticated users';

-- Enable RLS
alter table user_profiles enable row level security;

-- Create policies
create policy "users can view their own profile" on user_profiles
    for select using (auth.uid() = user_id);

create policy "users can update their own profile" on user_profiles
    for update using (auth.uid() = user_id);

create policy "users can insert their own profile" on user_profiles
    for insert with check (auth.uid() = user_id);

-- Create user_notification_preferences table
create table user_notification_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    language varchar(10) default 'en',
    communication_style varchar(50) default 'standard',
    reminder_channels varchar[] not null default array['push'],
    quiet_hours_start time,
    quiet_hours_end time,
    daily_summary_time time,
    weekly_report_day integer,
    weekly_report_time time,
    enable_push boolean default true,
    enable_sms boolean default false,
    enable_email boolean default true,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

comment on table user_notification_preferences is 'Stores notification preferences for each user';

-- Enable RLS
alter table user_notification_preferences enable row level security;

-- Create policies
create policy "users can view their own notification preferences" on user_notification_preferences
    for select using (auth.uid() = user_id);

create policy "users can update their own notification preferences" on user_notification_preferences
    for update using (auth.uid() = user_id);

create policy "users can insert their own notification preferences" on user_notification_preferences
    for insert with check (auth.uid() = user_id);

-- Create user_usage_tracking table
create table user_usage_tracking (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    session_count integer default 0,
    last_active_date date,
    feature_usage jsonb,
    app_version varchar(20),
    device_type varchar(50),
    onboarding_completed boolean default false,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

comment on table user_usage_tracking is 'Tracks user engagement and feature usage';

-- Enable RLS
alter table user_usage_tracking enable row level security;

-- Create policies
create policy "users can view their own usage data" on user_usage_tracking
    for select using (auth.uid() = user_id);

create policy "users can update their own usage data" on user_usage_tracking
    for update using (auth.uid() = user_id);

create policy "users can insert their own usage data" on user_usage_tracking
    for insert with check (auth.uid() = user_id);

-- Create indexes
create index idx_user_profiles_user_id on user_profiles(user_id);
create index idx_user_notification_preferences_user_id on user_notification_preferences(user_id);
create index idx_user_usage_tracking_user_id on user_usage_tracking(user_id);
create index idx_user_usage_tracking_last_active on user_usage_tracking(last_active_date);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_user_profiles_updated_at
    before update on user_profiles
    for each row
    execute function update_updated_at_column();

create trigger update_user_notification_preferences_updated_at
    before update on user_notification_preferences
    for each row
    execute function update_updated_at_column();

create trigger update_user_usage_tracking_updated_at
    before update on user_usage_tracking
    for each row
    execute function update_updated_at_column(); 