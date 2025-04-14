-- Migration: Medication management tables
-- Description: Creates tables for medications, schedules, and photos
-- Author: System
-- Date: 2024-03-19

-- Create medication_categories table
create table medication_categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(50) not null unique,
    description varchar(255),
    created_at timestamptz not null default now()
);

comment on table medication_categories is 'Predefined categories for medications';

-- Enable RLS
alter table medication_categories enable row level security;

-- Allow public read access to medication categories
create policy "medication categories are viewable by everyone" on medication_categories
    for select using (true);

-- Create medications table
create table medications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name varchar(255) not null,
    form varchar(50) not null,
    strength varchar(100),
    strength_unit_id uuid references measurement_units(id),
    category medication_category not null,
    purpose varchar(255),
    instructions text,
    prescribing_doctor varchar(255),
    pharmacy varchar(255),
    prescription_number varchar(100),
    is_active boolean default true,
    start_date date not null,
    end_date date,
    refill_reminder_days integer default 7,
    pills_remaining integer,
    pills_per_refill integer,
    last_refill_date date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table medications is 'Stores medication information for users';

-- Enable RLS
alter table medications enable row level security;

-- Create policies
create policy "users can view their own medications" on medications
    for select using (auth.uid() = user_id);

create policy "users can update their own medications" on medications
    for update using (auth.uid() = user_id);

create policy "users can insert their own medications" on medications
    for insert with check (auth.uid() = user_id);

create policy "users can delete their own medications" on medications
    for delete using (auth.uid() = user_id);

-- Create medication_schedules table
create table medication_schedules (
    id uuid primary key default gen_random_uuid(),
    medication_id uuid not null references medications(id) on delete cascade,
    schedule_type varchar(50) not null,
    schedule_pattern jsonb not null,
    dose_amount decimal(8,3) not null,
    dose_unit_id uuid references measurement_units(id),
    with_food boolean default false,
    with_water boolean default false,
    special_instructions text,
    start_date date not null,
    end_date date,
    is_active boolean default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table medication_schedules is 'Stores scheduling information for medications';

-- Enable RLS
alter table medication_schedules enable row level security;

-- Create policies
create policy "users can view their medication schedules" on medication_schedules
    for select using (
        exists (
            select 1 from medications
            where medications.id = medication_schedules.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can update their medication schedules" on medication_schedules
    for update using (
        exists (
            select 1 from medications
            where medications.id = medication_schedules.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can insert their medication schedules" on medication_schedules
    for insert with check (
        exists (
            select 1 from medications
            where medications.id = medication_schedules.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can delete their medication schedules" on medication_schedules
    for delete using (
        exists (
            select 1 from medications
            where medications.id = medication_schedules.medication_id
            and medications.user_id = auth.uid()
        )
    );

-- Create medication_photos table
create table medication_photos (
    id uuid primary key default gen_random_uuid(),
    medication_id uuid not null references medications(id) on delete cascade,
    s3_key varchar(255) not null,
    original_filename varchar(255),
    is_primary boolean default false,
    content_type varchar(100),
    size_bytes integer,
    recognition_status varchar(50) default 'pending',
    recognition_data jsonb,
    created_at timestamptz not null default now()
);

comment on table medication_photos is 'Stores photos of medications';

-- Enable RLS
alter table medication_photos enable row level security;

-- Create policies
create policy "users can view their medication photos" on medication_photos
    for select using (
        exists (
            select 1 from medications
            where medications.id = medication_photos.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can insert their medication photos" on medication_photos
    for insert with check (
        exists (
            select 1 from medications
            where medications.id = medication_photos.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can delete their medication photos" on medication_photos
    for delete using (
        exists (
            select 1 from medications
            where medications.id = medication_photos.medication_id
            and medications.user_id = auth.uid()
        )
    );

-- Create medication_escalation_rules table
create table medication_escalation_rules (
    id uuid primary key default gen_random_uuid(),
    medication_id uuid not null references medications(id) on delete cascade,
    priority_level integer not null default 1,
    escalation_step integer not null,
    delay_minutes integer not null,
    message_type varchar(50) not null,
    enabled boolean default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table medication_escalation_rules is 'Defines escalation rules for medication reminders';

-- Enable RLS
alter table medication_escalation_rules enable row level security;

-- Create policies
create policy "users can view their medication escalation rules" on medication_escalation_rules
    for select using (
        exists (
            select 1 from medications
            where medications.id = medication_escalation_rules.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can update their medication escalation rules" on medication_escalation_rules
    for update using (
        exists (
            select 1 from medications
            where medications.id = medication_escalation_rules.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can insert their medication escalation rules" on medication_escalation_rules
    for insert with check (
        exists (
            select 1 from medications
            where medications.id = medication_escalation_rules.medication_id
            and medications.user_id = auth.uid()
        )
    );

create policy "users can delete their medication escalation rules" on medication_escalation_rules
    for delete using (
        exists (
            select 1 from medications
            where medications.id = medication_escalation_rules.medication_id
            and medications.user_id = auth.uid()
        )
    );

-- Create indexes
create index idx_medications_user_id on medications(user_id);
create index idx_medications_category on medications(category);
create index idx_medications_is_active on medications(is_active);
create index idx_medication_schedules_medication_id on medication_schedules(medication_id);
create index idx_medication_schedules_start_end on medication_schedules(start_date, end_date);
create index idx_medication_photos_medication_id on medication_photos(medication_id);
create index idx_medication_escalation_rules_medication_id on medication_escalation_rules(medication_id);

-- Add updated_at triggers
create trigger update_medications_updated_at
    before update on medications
    for each row
    execute function update_updated_at_column();

create trigger update_medication_schedules_updated_at
    before update on medication_schedules
    for each row
    execute function update_updated_at_column();

create trigger update_medication_escalation_rules_updated_at
    before update on medication_escalation_rules
    for each row
    execute function update_updated_at_column(); 