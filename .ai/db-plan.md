# Schema bazy danych dla aplikacji MedMinder Plus

## 1. Lista tabel

### Zarządzanie użytkownikami

#### users
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE NOT NULL
- `hashed_password` VARCHAR(255) NOT NULL
- `auth_provider` VARCHAR(50) DEFAULT 'email'
- `auth_provider_id` VARCHAR(255)
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `last_login_at` TIMESTAMP WITH TIME ZONE
- `is_active` BOOLEAN DEFAULT TRUE

#### user_profiles
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `first_name` VARCHAR(100)
- `last_name` VARCHAR(100)
- `age` INTEGER
- `gender` VARCHAR(50)
- `weight` DECIMAL(5,2)
- `weight_unit` VARCHAR(10) DEFAULT 'kg'
- `activity_level` VARCHAR(50)
- `work_type` VARCHAR(50)
- `timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC'
- `health_conditions` JSONB
- `allergies` JSONB
- `health_literacy_level` VARCHAR(20)
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### user_notification_preferences
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `language` VARCHAR(10) DEFAULT 'en'
- `communication_style` VARCHAR(50) DEFAULT 'standard'
- `reminder_channels` VARCHAR[] NOT NULL DEFAULT '{push}'
- `quiet_hours_start` TIME
- `quiet_hours_end` TIME
- `daily_summary_time` TIME
- `weekly_report_day` INTEGER
- `weekly_report_time` TIME
- `enable_push` BOOLEAN DEFAULT TRUE
- `enable_sms` BOOLEAN DEFAULT FALSE
- `enable_email` BOOLEAN DEFAULT TRUE
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### user_usage_tracking
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `session_count` INTEGER DEFAULT 0
- `last_active_date` DATE
- `feature_usage` JSONB
- `app_version` VARCHAR(20)
- `device_type` VARCHAR(50)
- `onboarding_completed` BOOLEAN DEFAULT FALSE
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

### Zarządzanie lekami

#### medications
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `name` VARCHAR(255) NOT NULL
- `form` VARCHAR(50) NOT NULL
- `strength` VARCHAR(100)
- `strength_unit_id` UUID REFERENCES measurement_units(id)
- `category` medication_category NOT NULL
- `purpose` VARCHAR(255)
- `instructions` TEXT
- `prescribing_doctor` VARCHAR(255)
- `pharmacy` VARCHAR(255)
- `prescription_number` VARCHAR(100)
- `is_active` BOOLEAN DEFAULT TRUE
- `start_date` DATE NOT NULL
- `end_date` DATE
- `refill_reminder_days` INTEGER DEFAULT 7
- `pills_remaining` INTEGER
- `pills_per_refill` INTEGER
- `last_refill_date` DATE
- `notes` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### medication_categories
- `id` UUID PRIMARY KEY
- `name` VARCHAR(50) NOT NULL UNIQUE
- `description` VARCHAR(255)

#### measurement_units
- `id` UUID PRIMARY KEY
- `name` VARCHAR(50) NOT NULL UNIQUE
- `abbreviation` VARCHAR(10) NOT NULL UNIQUE
- `type` VARCHAR(50) NOT NULL

#### medication_schedules
- `id` UUID PRIMARY KEY
- `medication_id` UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE
- `schedule_type` VARCHAR(50) NOT NULL
- `schedule_pattern` JSONB NOT NULL
- `dose_amount` DECIMAL(8,3) NOT NULL
- `dose_unit_id` UUID REFERENCES measurement_units(id)
- `with_food` BOOLEAN DEFAULT FALSE
- `with_water` BOOLEAN DEFAULT FALSE
- `special_instructions` TEXT
- `start_date` DATE NOT NULL
- `end_date` DATE
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### medication_photos
- `id` UUID PRIMARY KEY
- `medication_id` UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE
- `s3_key` VARCHAR(255) NOT NULL
- `original_filename` VARCHAR(255)
- `is_primary` BOOLEAN DEFAULT FALSE
- `content_type` VARCHAR(100)
- `size_bytes` INTEGER
- `recognition_status` VARCHAR(50) DEFAULT 'pending'
- `recognition_data` JSONB
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### medication_escalation_rules
- `id` UUID PRIMARY KEY
- `medication_id` UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE
- `priority_level` INTEGER NOT NULL DEFAULT 1
- `escalation_step` INTEGER NOT NULL
- `delay_minutes` INTEGER NOT NULL
- `message_type` VARCHAR(50) NOT NULL
- `enabled` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

### Adherencja i analityka

#### adherence_records
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `medication_id` UUID NOT NULL REFERENCES medications(id)
- `schedule_id` UUID NOT NULL REFERENCES medication_schedules(id)
- `scheduled_time` TIMESTAMP WITH TIME ZONE NOT NULL
- `taken_time` TIMESTAMP WITH TIME ZONE
- `status` adherence_status NOT NULL
- `skip_reason_id` UUID REFERENCES skip_reasons(id)
- `skip_reason_custom` TEXT
- `dose_amount` DECIMAL(8,3)
- `response_time_seconds` INTEGER
- `notes` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### skip_reasons
- `id` UUID PRIMARY KEY
- `reason` VARCHAR(255) NOT NULL UNIQUE
- `is_common` BOOLEAN DEFAULT TRUE
- `category` VARCHAR(50)
- `requires_followup` BOOLEAN DEFAULT FALSE

#### notifications
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `medication_id` UUID REFERENCES medications(id)
- `schedule_id` UUID REFERENCES medication_schedules(id)
- `adherence_record_id` UUID REFERENCES adherence_records(id)
- `notification_type` VARCHAR(50) NOT NULL
- `scheduled_time` TIMESTAMP WITH TIME ZONE NOT NULL
- `sent_time` TIMESTAMP WITH TIME ZONE
- `message` TEXT NOT NULL
- `channel` VARCHAR(50) NOT NULL
- `escalation_level` INTEGER DEFAULT 0
- `is_read` BOOLEAN DEFAULT FALSE
- `read_time` TIMESTAMP WITH TIME ZONE
- `response_action` VARCHAR(50)
- `response_time` TIMESTAMP WITH TIME ZONE
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### notification_effectiveness
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id)
- `notification_id` UUID NOT NULL REFERENCES notifications(id)
- `was_effective` BOOLEAN
- `response_time_seconds` INTEGER
- `notification_variant` VARCHAR(50)
- `message_style` VARCHAR(50)
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### medication_interactions
- `id` UUID PRIMARY KEY
- `medication_id_1` UUID NOT NULL REFERENCES medications(id)
- `medication_id_2` UUID NOT NULL REFERENCES medications(id)
- `interaction_level` VARCHAR(50) NOT NULL
- `interaction_description` TEXT NOT NULL
- `data_source` VARCHAR(255) NOT NULL
- `reference_url` VARCHAR(255)
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### adherence_reports
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `report_type` VARCHAR(50) NOT NULL
- `start_date` DATE NOT NULL
- `end_date` DATE NOT NULL
- `overall_adherence_rate` DECIMAL(5,2)
- `report_data` JSONB NOT NULL
- `insights` JSONB
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

#### adherence_report_medications
- `id` UUID PRIMARY KEY
- `report_id` UUID NOT NULL REFERENCES adherence_reports(id) ON DELETE CASCADE
- `medication_id` UUID NOT NULL REFERENCES medications(id)
- `adherence_rate` DECIMAL(5,2) NOT NULL
- `doses_scheduled` INTEGER NOT NULL
- `doses_taken` INTEGER NOT NULL
- `doses_missed` INTEGER NOT NULL
- `average_delay_minutes` DECIMAL(10,2)

#### user_engagement
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `date` DATE NOT NULL
- `app_opens` INTEGER DEFAULT 0
- `total_session_duration_seconds` INTEGER DEFAULT 0
- `education_content_views` INTEGER DEFAULT 0
- `reminders_received` INTEGER DEFAULT 0
- `reminders_responded` INTEGER DEFAULT 0
- `adherence_dashboard_views` INTEGER DEFAULT 0
- `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()

### Archiwum

#### adherence_records_archive
- (Taka sama struktura jak adherence_records z dodatkowym polem archive_date)
- `archive_date` DATE NOT NULL

## 2. Typy ENUM

```sql
CREATE TYPE medication_category AS ENUM ('chronic', 'acute', 'as_needed');
CREATE TYPE adherence_status AS ENUM ('taken', 'missed', 'skipped', 'pending');
```

## 3. Relacje między tabelami

### Jeden-do-jednego
- user <-> user_profile
- user <-> user_notification_preferences
- user <-> user_usage_tracking

### Jeden-do-wielu
- user -> medications
- user -> adherence_records
- user -> adherence_reports
- user -> notifications
- user -> user_engagement
- medication -> medication_photos
- medication -> medication_escalation_rules
- medication -> medication_schedules
- medication_schedule -> adherence_records
- adherence_report -> adherence_report_medications

### Wiele-do-wielu
- medications <-> skip_reasons (poprzez adherence_records)
- medications <-> medications (jako medication_interactions)

## 4. Indeksy

```sql
-- Indeksy dla users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);

-- Indeksy dla medication_schedules
CREATE INDEX idx_medication_schedules_medication_id ON medication_schedules(medication_id);
CREATE INDEX idx_medication_schedules_start_end ON medication_schedules(start_date, end_date);

-- Indeksy dla adherence_records
CREATE INDEX idx_adherence_records_user_id ON adherence_records(user_id);
CREATE INDEX idx_adherence_records_medication_id ON adherence_records(medication_id);
CREATE INDEX idx_adherence_records_schedule_id ON adherence_records(schedule_id);
CREATE INDEX idx_adherence_records_scheduled_time ON adherence_records(scheduled_time);
CREATE INDEX idx_adherence_records_status ON adherence_records(status);
CREATE INDEX idx_adherence_records_scheduled_time_user_id ON adherence_records(user_id, scheduled_time);

-- Indeksy dla notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled_time ON notifications(scheduled_time);
CREATE INDEX idx_notifications_medication_id ON notifications(medication_id);
CREATE INDEX idx_notifications_scheduled_time_user_id ON notifications(user_id, scheduled_time);

-- Indeksy dla adherence_reports
CREATE INDEX idx_adherence_reports_user_id ON adherence_reports(user_id);
CREATE INDEX idx_adherence_reports_date_range ON adherence_reports(user_id, start_date, end_date);

-- Indeksy dla user_engagement
CREATE INDEX idx_user_engagement_user_id_date ON user_engagement(user_id, date);
```

## 5. Partycjonowanie tabel

```sql
-- Partycjonowanie tabeli adherence_records według miesięcy
CREATE TABLE adherence_records_partitioned (
    -- Taka sama struktura jak adherence_records
) PARTITION BY RANGE (scheduled_time);

-- Przykładowe partycje (można tworzyć automatycznie)
CREATE TABLE adherence_records_y2023m01 PARTITION OF adherence_records_partitioned
    FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');
CREATE TABLE adherence_records_y2023m02 PARTITION OF adherence_records_partitioned
    FOR VALUES FROM ('2023-02-01') TO ('2023-03-01');
-- itd.
```

## 6. Row Level Security (RLS)

```sql
-- Włączenie RLS na tabelach
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_reports ENABLE ROW LEVEL SECURITY;
-- itd. dla pozostałych tabel zawierających dane użytkowników

-- Funkcja pomocnicza zwracająca ID bieżącego użytkownika
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    RETURN (SELECT auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Polityki RLS
CREATE POLICY user_isolation ON users
    USING (id = current_user_id());

CREATE POLICY user_profile_isolation ON user_profiles
    USING (user_id = current_user_id());

CREATE POLICY medications_isolation ON medications
    USING (user_id = current_user_id());

CREATE POLICY medication_schedules_isolation ON medication_schedules
    USING (medication_id IN (SELECT id FROM medications WHERE user_id = current_user_id()));

CREATE POLICY adherence_records_isolation ON adherence_records
    USING (user_id = current_user_id());

CREATE POLICY notifications_isolation ON notifications
    USING (user_id = current_user_id());

CREATE POLICY adherence_reports_isolation ON adherence_reports
    USING (user_id = current_user_id());
```

## 7. Materialized Views

```sql
-- Materialized view dla przyspieszenia raportów adherencji
CREATE MATERIALIZED VIEW mv_user_weekly_adherence AS
SELECT
    user_id,
    medication_id,
    date_trunc('week', scheduled_time) AS week_start,
    COUNT(*) AS total_doses,
    SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) AS doses_taken,
    SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) AS doses_missed,
    SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) AS doses_skipped,
    ROUND((SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2) AS adherence_rate,
    AVG(CASE WHEN status = 'taken' AND taken_time IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (taken_time - scheduled_time))/60 
        ELSE NULL END) AS avg_delay_minutes
FROM
    adherence_records
GROUP BY
    user_id, medication_id, date_trunc('week', scheduled_time);

-- Indeks na widoku
CREATE UNIQUE INDEX idx_mv_user_weekly_adherence_pk ON mv_user_weekly_adherence(user_id, medication_id, week_start);
```

## 8. Procedury do obsługi archiwizacji danych

```sql
-- Procedura archiwizująca dane starsze niż rok
CREATE OR REPLACE PROCEDURE archive_old_adherence_records()
LANGUAGE plpgsql
AS $$
DECLARE
    cutoff_date DATE := CURRENT_DATE - INTERVAL '1 year';
BEGIN
    -- Przeniesienie starych rekordów do tabeli archiwalnej
    INSERT INTO adherence_records_archive
    SELECT *, CURRENT_DATE as archive_date
    FROM adherence_records
    WHERE scheduled_time < cutoff_date;
    
    -- Usunięcie zarchiwizowanych rekordów z głównej tabeli
    DELETE FROM adherence_records
    WHERE scheduled_time < cutoff_date;
    
    COMMIT;
END;
$$;
```

## 9. Funkcje pomocnicze

```sql
-- Funkcja zwracająca aktualny poziom adherencji użytkownika
CREATE OR REPLACE FUNCTION get_user_adherence_rate(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
    adherence_rate DECIMAL(5,2);
BEGIN
    SELECT 
        ROUND((SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END)::numeric / 
        COUNT(*)::numeric) * 100, 2) INTO adherence_rate
    FROM adherence_records
    WHERE 
        user_id = p_user_id AND
        scheduled_time >= CURRENT_DATE - (p_days || ' days')::INTERVAL;
        
    RETURN adherence_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja tworząca przypomnienia na podstawie harmonogramów leków
CREATE OR REPLACE FUNCTION generate_medication_reminders(p_date DATE)
RETURNS INTEGER AS $$
DECLARE
    reminders_count INTEGER := 0;
BEGIN
    -- Logika generowania przypomnień na podstawie schematów w medication_schedules
    -- ...
    
    RETURN reminders_count;
END;
$$ LANGUAGE plpgsql;
```

## 10. Uwagi dotyczące implementacji

1. Wszystkie czasy są przechowywane w UTC, a konwersja na czas lokalny użytkownika powinna odbywać się w warstwie aplikacji na podstawie pola timezone z tabeli user_profiles.

2. Dla obsługi złożonych wzorców dawkowania wykorzystujemy pole JSONB (schedule_pattern), które pozwala na elastyczne definiowanie różnych schematów przyjmowania leków (codziennie, co drugi dzień, określone dni tygodnia, itd.).

3. Mechanizm partycjonowania tabeli adherence_records według miesięcy pozwoli na efektywne zarządzanie dużą ilością danych i szybkie usuwanie starszych rekordów.

4. Row Level Security zapewnia, że użytkownicy mają dostęp tylko do swoich własnych danych, co jest kluczowe dla danych medycznych.

5. Materialized Views przyspieszają generowanie raportów adherencji poprzez wstępne obliczanie agregacji, które mogą być regularnie odświeżane.

6. Procedury archiwizacji automatycznie przenoszą dane starsze niż rok do tabel archiwalnych, utrzymując główne tabele w optymalnym rozmiarze.

7. Wykorzystanie typów ENUM zapewnia spójność danych i ułatwia definiowanie dozwolonych wartości dla określonych pól.

8. Przechowywanie zdjęć leków jest realizowane poprzez zapisywanie referencji do plików na S3 w tabeli medication_photos, co pozwala na skalowalną obsługę dużych plików binarnych. 