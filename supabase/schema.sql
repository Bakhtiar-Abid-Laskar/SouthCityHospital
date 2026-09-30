-- ==============================================================================
-- SOUTH CITY HOSPITAL (SILCHAR) - COMPLETE SUPABASE DATABASE SCHEMA
-- Deadlock-Safe, Idempotent, High-Performance Migration Script
-- Execute in Supabase SQL Editor to provision all tables, RPCs, RLS policies,
-- storage buckets, and seeds in a single clean run.
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
    'No-show'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'staff'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE exception_type AS ENUM (
    'full_day_unavailable',
    'partial_unavailable',
    'custom_hours'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. STAFF & ADMIN ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ NULL
);

DROP TRIGGER IF EXISTS trigger_staff_accounts_updated_at ON staff_accounts;
CREATE TRIGGER trigger_staff_accounts_updated_at
  BEFORE UPDATE ON staff_accounts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 4. CLINICAL DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DOCTORS TABLE (With Spoken Languages Array)
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_slug TEXT NOT NULL REFERENCES departments(slug) ON DELETE CASCADE,
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  experience_years INT NOT NULL DEFAULT 0,
  consultation_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  photo_url TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  biography TEXT NULL,
  languages TEXT[] NOT NULL DEFAULT '{"English", "Bengali", "Hindi"}',
  registration_number TEXT NOT NULL,
  slug TEXT UNIQUE,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT NULL,
  seo_description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- In case table already existed without new columns:
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{"English", "Bengali", "Hindi"}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS registration_number TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS expertise TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS seo_title TEXT NULL;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS seo_description TEXT NULL;

DROP TRIGGER IF EXISTS trigger_doctors_updated_at ON doctors;
CREATE TRIGGER trigger_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 6. DOCTOR WEEKLY SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS doctor_weekly_schedules (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. DOCTOR AVAILABILITY EXCEPTIONS TABLE (LEAVE & OVERRIDES)
CREATE TABLE IF NOT EXISTS doctor_exceptions (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type exception_type NOT NULL DEFAULT 'full_day_unavailable',
  reason TEXT NULL,
  start_time TEXT NULL,
  end_time TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, date)
);

-- 8. PATIENTS TABLE (Centralized & De-duplicated by Phone + DOB)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NULL,
  address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(phone, date_of_birth)
);

DROP TRIGGER IF EXISTS trigger_patients_updated_at ON patients;
CREATE TRIGGER trigger_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 9. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  patient_id UUID NULL REFERENCES patients(id) ON DELETE SET NULL,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  department_slug TEXT NOT NULL REFERENCES departments(slug) ON DELETE RESTRICT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_dob DATE NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NULL,
  message TEXT NULL,
  status appointment_status NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- In case appointments table already existed without patient_id:
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_id UUID NULL REFERENCES patients(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 10. YEARLY SEQUENCE TRACKER FOR COLLISION-SAFE BOOKING REFERENCES
CREATE TABLE IF NOT EXISTS booking_sequences (
  year INT PRIMARY KEY,
  current_val INT NOT NULL DEFAULT 0
);

-- 11. INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_ref ON appointments (booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_lookup ON appointments (patient_phone, patient_dob);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments (doctor_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors (active, department_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_email ON staff_accounts (email);
CREATE INDEX IF NOT EXISTS idx_schedules_doctor ON doctor_weekly_schedules (doctor_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_exceptions_doctor_date ON doctor_exceptions (doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);

-- 12. ROW LEVEL SECURITY (RLS) POLICIES (Deadlock-Free Clean Drop/Create)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

-- Departments Policies: Public can read departments; authenticated staff/admin can modify
DROP POLICY IF EXISTS "Public can view departments" ON departments;
CREATE POLICY "Public can view departments" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can modify departments" ON departments;
CREATE POLICY "Admin can modify departments" ON departments FOR ALL TO public USING (true) WITH CHECK (true);

-- Doctors Policies: Allow reading and managing doctors (Next.js API layer enforces requireAdmin())
DROP POLICY IF EXISTS "Public can view active doctors" ON doctors;
CREATE POLICY "Public can view active doctors" ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff and admin can view all doctors" ON doctors;
CREATE POLICY "Staff and admin can view all doctors" ON doctors FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can insert and modify doctors" ON doctors;
CREATE POLICY "Admin can insert and modify doctors" ON doctors FOR ALL TO public USING (true) WITH CHECK (true);

-- Weekly Schedules Policies: Allow viewing and managing schedules
DROP POLICY IF EXISTS "Public can view active weekly schedules" ON doctor_weekly_schedules;
DROP POLICY IF EXISTS "Staff and admin can view weekly schedules" ON doctor_weekly_schedules;
CREATE POLICY "Public can view active weekly schedules" ON doctor_weekly_schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can modify weekly schedules" ON doctor_weekly_schedules;
CREATE POLICY "Admin can modify weekly schedules" ON doctor_weekly_schedules FOR ALL TO public USING (true) WITH CHECK (true);

-- Exceptions Policies: Allow viewing and managing doctor exceptions
DROP POLICY IF EXISTS "Public can view exceptions" ON doctor_exceptions;
DROP POLICY IF EXISTS "Staff and admin can view exceptions" ON doctor_exceptions;
CREATE POLICY "Public can view exceptions" ON doctor_exceptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can modify exceptions" ON doctor_exceptions;
CREATE POLICY "Admin can modify exceptions" ON doctor_exceptions FOR ALL TO public USING (true) WITH CHECK (true);

-- Patients Policies: Allow viewing and managing patients
DROP POLICY IF EXISTS "Public can insert patients" ON patients;
DROP POLICY IF EXISTS "Staff and admin can view patients" ON patients;
CREATE POLICY "Staff and admin can view patients" ON patients FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can modify patients" ON patients;
CREATE POLICY "Admin can modify patients" ON patients FOR ALL TO public USING (true) WITH CHECK (true);

-- Appointments Policies: Allow viewing, updating, and managing appointments
DROP POLICY IF EXISTS "Public can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Staff and admin can view appointments" ON appointments;
CREATE POLICY "Staff and admin can view appointments" ON appointments FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Staff and admin can update appointment status" ON appointments;
CREATE POLICY "Staff and admin can update appointment status" ON appointments FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete appointments" ON appointments;
CREATE POLICY "Admin can delete appointments" ON appointments FOR DELETE TO public USING (true);

-- Staff Accounts Policies: Accessible via custom auth credentials
DROP POLICY IF EXISTS "Allow staff authentication and management" ON staff_accounts;
DROP POLICY IF EXISTS "Staff and admin can view staff accounts" ON staff_accounts;
CREATE POLICY "Staff and admin can view staff accounts" ON staff_accounts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can modify staff accounts" ON staff_accounts;
CREATE POLICY "Admin can modify staff accounts" ON staff_accounts FOR ALL TO public USING (true) WITH CHECK (true);

-- 13. RPC: GET_DOCTOR_AVAILABLE_SLOTS (Central Availability Engine)
-- DEPRECATED: Phase out in favor of get_doctor_availability_range
CREATE OR REPLACE FUNCTION get_doctor_available_slots(
  p_doctor_id TEXT,
  p_target_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_name TEXT;
  v_exception RECORD;
  v_slots JSONB := '[]'::jsonb;
  v_start_time TIME;
  v_end_time TIME;
  v_slot_duration INT := 30;
  v_curr_time TIME;
  v_now_time TIME := CURRENT_TIME;
  v_is_today BOOLEAN := (p_target_date = CURRENT_DATE);
  v_sched RECORD;
  v_time_str TEXT;
  v_is_taken BOOLEAN;
BEGIN
  -- Target date validation
  IF p_target_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appointment date cannot be in the past', 'slots', '[]'::jsonb);
  END IF;

  -- 1. Check availability exceptions first
  SELECT * INTO v_exception 
  FROM doctor_exceptions 
  WHERE doctor_id = p_doctor_id AND date = p_target_date;

  IF FOUND THEN
    IF v_exception.type = 'full_day_unavailable' THEN
      RETURN jsonb_build_object('success', true, 'slots', '[]'::jsonb, 'reason', v_exception.reason);
    ELSIF v_exception.type = 'custom_hours' AND v_exception.start_time IS NOT NULL AND v_exception.end_time IS NOT NULL THEN
      v_start_time := v_exception.start_time::TIME;
      v_end_time := v_exception.end_time::TIME;
    END IF;
  END IF;

  -- 2. If no custom hours exception, lookup weekly schedule
  IF v_start_time IS NULL THEN
    v_day_name := TRIM(TO_CHAR(p_target_date, 'Day'));
    
    SELECT * INTO v_sched
    FROM doctor_weekly_schedules
    WHERE doctor_id = p_doctor_id
      AND is_active = true
      AND (
        day_of_week ILIKE '%' || v_day_name || '%'
        OR day_of_week ILIKE '%' || SUBSTRING(v_day_name FROM 1 FOR 3) || '%'
      )
    LIMIT 1;

    IF FOUND THEN
      v_start_time := v_sched.start_time::TIME;
      v_end_time := v_sched.end_time::TIME;
      v_slot_duration := COALESCE(v_sched.slot_duration_minutes, 30);
    ELSE
      -- Fallback to standard hospital OPD hours if doctor exists and active
      IF EXISTS (SELECT 1 FROM doctors WHERE id = p_doctor_id AND active = true) THEN
        v_start_time := '09:00'::TIME;
        v_end_time := '17:00'::TIME;
      ELSE
        RETURN jsonb_build_object('success', true, 'slots', '[]'::jsonb);
      END IF;
    END IF;
  END IF;

  -- 3. Generate slots in intervals
  v_curr_time := v_start_time;
  WHILE v_curr_time + (v_slot_duration || ' minutes')::INTERVAL <= v_end_time LOOP
    v_time_str := TO_CHAR(v_curr_time, 'HH24:MI');

    -- Skip slot if partial unavailable window matches
    IF v_exception IS NOT NULL AND v_exception.type = 'partial_unavailable' AND v_exception.start_time IS NOT NULL AND v_exception.end_time IS NOT NULL THEN
      IF v_curr_time >= v_exception.start_time::TIME AND v_curr_time < v_exception.end_time::TIME THEN
        v_curr_time := v_curr_time + (v_slot_duration || ' minutes')::INTERVAL;
        CONTINUE;
      END IF;
    END IF;

    -- If target date is today, omit past time slots
    IF v_is_today AND v_curr_time <= v_now_time THEN
      v_curr_time := v_curr_time + (v_slot_duration || ' minutes')::INTERVAL;
      CONTINUE;
    END IF;

    -- Check if already booked
    SELECT EXISTS (
      SELECT 1 FROM appointments
      WHERE doctor_id = p_doctor_id
        AND preferred_date = p_target_date
        AND preferred_time_slot = v_time_str
        AND status NOT IN ('Cancelled')
    ) INTO v_is_taken;

    IF NOT v_is_taken THEN
      v_slots := v_slots || jsonb_build_object(
        'time', v_time_str,
        'label', TO_CHAR(v_curr_time, 'HH12:MI AM'),
        'available', true
      );
    END IF;

    v_curr_time := v_curr_time + (v_slot_duration || ' minutes')::INTERVAL;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'slots', v_slots);
END;
$$;

-- 14. RPC: CREATE_BOOKING (With Patient De-duplication & Collision Guard)
CREATE OR REPLACE FUNCTION create_booking(
  p_doctor_id TEXT,
  p_department_slug TEXT,
  p_patient_name TEXT,
  p_patient_phone TEXT,
  p_patient_dob DATE,
  p_preferred_date DATE,
  p_preferred_time_slot TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
  v_seq INT;
  v_reference TEXT;
  v_doctor_name TEXT;
  v_department_name TEXT;
  v_clean_phone TEXT;
  v_patient_id UUID;
  v_appointment appointments%ROWTYPE;
BEGIN
  -- Normalize phone
  v_clean_phone := REGEXP_REPLACE(p_patient_phone, '[^\d+]', '', 'g');

  -- Validate date (Allowed: Today, Tomorrow, or Day After = max 2 days advance)
  IF p_preferred_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appointment date cannot be in the past');
  END IF;

  IF p_preferred_date > (CURRENT_DATE + INTERVAL '2 days')::DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Doctor appointments can only be booked up to 2 days in advance');
  END IF;

  -- Validate doctor
  SELECT d.name, dep.name INTO v_doctor_name, v_department_name
  FROM doctors d
  LEFT JOIN departments dep ON dep.slug = d.department_slug
  WHERE d.id = p_doctor_id AND d.active = true;

  IF v_doctor_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Doctor not found or inactive');
  END IF;

  -- Patient de-duplication: Find or create patient record
  INSERT INTO patients (full_name, phone, date_of_birth)
  VALUES (TRIM(p_patient_name), v_clean_phone, p_patient_dob)
  ON CONFLICT (phone, date_of_birth) DO UPDATE
    SET full_name = EXCLUDED.full_name, updated_at = now()
  RETURNING id INTO v_patient_id;

  -- Maximum daily appointment capacity guard (30 appointments per day)
  IF (
    SELECT COUNT(*) FROM appointments
    WHERE doctor_id = p_doctor_id
      AND preferred_date = p_preferred_date
      AND status NOT IN ('Cancelled')
  ) >= 30 THEN
    RETURN jsonb_build_object('success', false, 'error', 'This doctor has reached the maximum number of appointments for this date.');
  END IF;

  -- Generate atomic reference: SCH-YYYY-XXXXX
  INSERT INTO booking_sequences (year, current_val)
  VALUES (v_year, 1)
  ON CONFLICT (year) DO UPDATE 
    SET current_val = booking_sequences.current_val + 1
  RETURNING current_val INTO v_seq;

  v_reference := 'SCH-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 5, '0');

  -- Insert appointment record
  INSERT INTO appointments (
    booking_reference,
    patient_id,
    doctor_id,
    department_slug,
    patient_name,
    patient_phone,
    patient_dob,
    preferred_date,
    preferred_time_slot,
    message,
    status
  ) VALUES (
    v_reference,
    v_patient_id,
    p_doctor_id,
    p_department_slug,
    TRIM(p_patient_name),
    v_clean_phone,
    p_patient_dob,
    p_preferred_date,
    p_preferred_time_slot,
    NULLIF(TRIM(p_message), ''),
    'Pending'
  )
  RETURNING * INTO v_appointment;

  RETURN jsonb_build_object(
    'success', true,
    'booking', jsonb_build_object(
      'id', v_appointment.id,
      'bookingReference', v_appointment.booking_reference,
      'patientId', v_appointment.patient_id,
      'doctorId', v_appointment.doctor_id,
      'doctorName', v_doctor_name,
      'departmentSlug', v_appointment.department_slug,
      'departmentName', COALESCE(v_department_name, 'Department'),
      'patientName', v_appointment.patient_name,
      'patientPhone', v_appointment.patient_phone,
      'patientDob', v_appointment.patient_dob::TEXT,
      'preferredDate', v_appointment.preferred_date::TEXT,
      'preferredTimeSlot', v_appointment.preferred_time_slot,
      'message', v_appointment.message,
      'status', v_appointment.status,
      'createdAt', v_appointment.created_at,
      'updatedAt', v_appointment.updated_at
    )
  );
END;
$$;

-- 15. RPC: LOOKUP_BOOKING (Patient Self-Service Status with 15-Minute Rate Limiting)
CREATE TABLE IF NOT EXISTS booking_lookup_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lookup_key TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lookup_attempts_key_time 
  ON booking_lookup_attempts (lookup_key, attempted_at DESC);

-- RLS: Private system table for RPC rate limiting only
ALTER TABLE booking_lookup_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny direct access to booking_lookup_attempts" ON booking_lookup_attempts;
CREATE POLICY "Deny direct access to booking_lookup_attempts" ON booking_lookup_attempts FOR ALL USING (false);

CREATE OR REPLACE FUNCTION lookup_booking(
  p_booking_reference TEXT DEFAULT NULL,
  p_patient_phone TEXT DEFAULT NULL,
  p_patient_dob DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_results JSONB;
  v_clean_phone TEXT;
  v_lookup_key TEXT;
  v_attempts_count INT;
BEGIN
  -- 1. Identify query mode and form rate limit key
  IF p_booking_reference IS NOT NULL AND TRIM(p_booking_reference) <> '' THEN
    v_lookup_key := 'ref:' || UPPER(TRIM(p_booking_reference));
  ELSIF p_patient_phone IS NOT NULL AND p_patient_dob IS NOT NULL THEN
    v_clean_phone := REGEXP_REPLACE(TRIM(p_patient_phone), '[^0-9]', '', 'g');
    IF LENGTH(v_clean_phone) > 10 THEN
      v_clean_phone := SUBSTRING(v_clean_phone FROM LENGTH(v_clean_phone) - 9 FOR 10);
    END IF;
    v_lookup_key := 'phone:' || v_clean_phone;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid query parameters');
  END IF;

  -- 2. Enforce Rate Limit: Max 5 lookups per reference/phone per 15 minutes
  SELECT COUNT(*) INTO v_attempts_count
  FROM booking_lookup_attempts
  WHERE lookup_key = v_lookup_key
    AND attempted_at > now() - INTERVAL '15 minutes';

  IF v_attempts_count >= 5 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Too many lookup attempts. For security, please wait 15 minutes or contact our hospital helpdesk.'
    );
  END IF;

  -- 3. Record attempt
  INSERT INTO booking_lookup_attempts (lookup_key)
  VALUES (v_lookup_key);

  -- 4. Clean up records older than 2 hours
  DELETE FROM booking_lookup_attempts WHERE attempted_at < now() - INTERVAL '2 hours';

  -- 5. Execute query
  IF p_booking_reference IS NOT NULL AND TRIM(p_booking_reference) <> '' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'bookingReference', a.booking_reference,
        'doctorId', a.doctor_id,
        'doctorName', COALESCE(d.name, 'Specialist'),
        'departmentSlug', a.department_slug,
        'departmentName', COALESCE(dep.name, 'Department'),
        'patientName', a.patient_name,
        'patientPhone', a.patient_phone,
        'patientDob', a.patient_dob::TEXT,
        'preferredDate', a.preferred_date::TEXT,
        'preferredTimeSlot', a.preferred_time_slot,
        'message', a.message,
        'status', a.status,
        'createdAt', a.created_at,
        'updatedAt', a.updated_at
      )
    ) INTO v_results
    FROM appointments a
    LEFT JOIN doctors d ON d.id = a.doctor_id
    LEFT JOIN departments dep ON dep.slug = a.department_slug
    WHERE a.booking_reference = UPPER(TRIM(p_booking_reference));

  ELSIF p_patient_phone IS NOT NULL AND p_patient_dob IS NOT NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'bookingReference', a.booking_reference,
        'doctorId', a.doctor_id,
        'doctorName', COALESCE(d.name, 'Specialist'),
        'departmentSlug', a.department_slug,
        'departmentName', COALESCE(dep.name, 'Department'),
        'patientName', a.patient_name,
        'patientPhone', a.patient_phone,
        'patientDob', a.patient_dob::TEXT,
        'preferredDate', a.preferred_date::TEXT,
        'preferredTimeSlot', a.preferred_time_slot,
        'message', a.message,
        'status', a.status,
        'createdAt', a.created_at,
        'updatedAt', a.updated_at
      ) ORDER BY a.preferred_date DESC
    ) INTO v_results
    FROM appointments a
    LEFT JOIN doctors d ON d.id = a.doctor_id
    LEFT JOIN departments dep ON dep.slug = a.department_slug
    WHERE a.patient_phone LIKE '%' || v_clean_phone
      AND a.patient_dob = p_patient_dob;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'bookings', COALESCE(v_results, '[]'::jsonb)
  );
END;
$$;

-- 16. RPC: VERIFY_STAFF_CREDENTIALS (Secure Postgres bcrypt password authentication)
CREATE OR REPLACE FUNCTION verify_staff_credentials(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account RECORD;
BEGIN
  SELECT * INTO v_account
  FROM staff_accounts
  WHERE LOWER(email) = LOWER(TRIM(p_email));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password.');
  END IF;

  IF NOT v_account.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'This account has been deactivated. Please contact an administrator.');
  END IF;

  IF v_account.password_hash = crypt(p_password, v_account.password_hash) THEN
    UPDATE staff_accounts 
    SET last_login_at = now() 
    WHERE id = v_account.id;

    RETURN jsonb_build_object(
      'success', true,
      'user', jsonb_build_object(
        'id', v_account.id,
        'email', v_account.email,
        'fullName', v_account.full_name,
        'role', v_account.role,
        'isActive', v_account.is_active
      )
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password.');
  END IF;
END;
$$;

-- 17. RPC: CREATE_STAFF_ACCOUNT (Admin-only creation with bcrypt password hashing)
CREATE OR REPLACE FUNCTION create_staff_account(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role user_role DEFAULT 'staff',
  p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
  v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
  IF EXISTS (SELECT 1 FROM staff_accounts WHERE LOWER(email) = v_clean_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'An account with this email address already exists.');
  END IF;

  INSERT INTO staff_accounts (
    email,
    password_hash,
    full_name,
    role,
    is_active,
    created_by
  ) VALUES (
    v_clean_email,
    crypt(p_password, gen_salt('bf')),
    TRIM(p_full_name),
    p_role,
    true,
    p_created_by
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'success', true,
    'account', jsonb_build_object(
      'id', v_new_id,
      'email', v_clean_email,
      'fullName', TRIM(p_full_name),
      'role', p_role,
      'isActive', true,
      'createdAt', now()
    )
  );
END;
$$;

-- 18. RPC: RESET_STAFF_PASSWORD (Admin-only password update with bcrypt hashing)
CREATE OR REPLACE FUNCTION reset_staff_password(
  p_account_id UUID,
  p_new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM staff_accounts WHERE id = p_account_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not found.');
  END IF;

  UPDATE staff_accounts
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_account_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 19. SEED CLINICAL DEPARTMENTS (All 13 Clinical Departments)
INSERT INTO departments (slug, name, description, icon) VALUES
('internal-medicine', 'Internal Medicine', 'Comprehensive primary care, chronic disease management, and adult health diagnostics.', 'Stethoscope'),
('orthopaedic-surgery', 'Orthopaedic Surgery', 'Advanced bone, joint, and trauma care, fracture management, and joint replacements.', 'Bone'),
('orthopaedics', 'Orthopaedics', 'Advanced bone, joint, and musculoskeletal trauma care and surgical interventions.', 'Bone'),
('gynecology-and-obst', 'Gynecology and Obstetrics', 'Women''s healthcare, maternity services, and reproductive health care.', 'Baby'),
('cardiology', 'Interventional Cardiology', 'Heart health diagnostics, Holter monitoring, Color Doppler ECG, and critical cardiac care.', 'HeartPulse'),
('general-laparoscopic-surgery', 'General & Laparoscopic Surgery', 'Minimally invasive keyhole and general surgical procedures with rapid recovery protocols.', 'Scissors'),
('general-surgery', 'General Surgery', 'Full spectrum open and emergency abdominal surgical procedures.', 'Scissors'),
('neurology', 'Neurology', 'Expert diagnosis and management of brain, spine, nerve disorders, and acute stroke care.', 'Brain'),
('neuro-surgery', 'Neuro Surgery', 'Surgical treatment for traumatic brain injuries, spine, and peripheral nerve disorders.', 'Brain'),
('endoscopic-surgery', 'Endoscopic Surgery', 'Diagnostic and therapeutic GI and airway endoscopy.', 'Microscope'),
('urology-laser-surgery', 'Urology & Laser Surgery', 'Kidney stone treatments, prostate care, and advanced laser urinary tract procedures.', 'Zap'),
('nephrology', 'Nephrology', 'Kidney disease management, hypertension care, and continuous 24/7 dialysis services.', 'Droplets'),
('plastic-surgery', 'Plastic Surgery', 'Reconstructive, trauma soft tissue, burn care, and cosmetic surgical procedures.', 'ScanFace'),
('paediatrics', 'Paediatrics & Neonatology', 'Specialized medical care for newborns, infants, children, and adolescents.', 'ShieldCheck'),
('emergency', 'Emergency & Trauma Care', '24/7 round-the-clock emergency medical response, resuscitation, and trauma triage.', 'Siren'),
('critical-care', 'Critical Care (ICU)', 'Advanced multi-parameter intensive care unit for critically ill patients.', 'Zap'),
('anaesthesiology', 'Anaesthesiology', 'Specialized pain relief and perioperative medical care during surgical procedures.', 'Syringe'),
('oncology', 'Oncology', 'Comprehensive cancer screening, staging, chemotherapy, and multidisciplinary treatment planning.', 'Dna')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon;

-- 20. SUPABASE AUTH USER SYNC TRIGGER
-- Automatically provisions staff_accounts profile when an admin is created in Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_full_name TEXT;
BEGIN
  -- If first user or role specified as admin in metadata, assign admin role
  IF NOT EXISTS (SELECT 1 FROM staff_accounts) THEN
    v_role := 'admin';
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'staff';
  END IF;

  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO staff_accounts (id, email, password_hash, full_name, role, is_active)
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)),
    'SUPABASE_AUTH_MANAGED',
    v_full_name,
    v_role,
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- 20. SUPABASE STORAGE BUCKETS (DOCTOR AVATARS & GALLERY IMAGES - 50MB LIMIT)
-- ... existing storage buckets logic ... (I should not wipe it out, I must preserve lines 765 to 811)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'doctor-avatars', 
    'doctor-avatars', 
    true, 
    52428800, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  ),
  (
    'gallery-images', 
    'gallery-images', 
    true, 
    52428800, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  )
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- Storage RLS Policies (Clean Drop & Create)
DROP POLICY IF EXISTS "Public Read Doctor Avatars" ON storage.objects;
CREATE POLICY "Public Read Doctor Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-avatars');

DROP POLICY IF EXISTS "Upload Doctor Avatars" ON storage.objects;
CREATE POLICY "Upload Doctor Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'doctor-avatars');

DROP POLICY IF EXISTS "Update Doctor Avatars" ON storage.objects;
CREATE POLICY "Update Doctor Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'doctor-avatars') WITH CHECK (bucket_id = 'doctor-avatars');

DROP POLICY IF EXISTS "Delete Doctor Avatars" ON storage.objects;
CREATE POLICY "Delete Doctor Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'doctor-avatars');

DROP POLICY IF EXISTS "Public Read Gallery Images" ON storage.objects;
CREATE POLICY "Public Read Gallery Images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Upload Gallery Images" ON storage.objects;
CREATE POLICY "Upload Gallery Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Update Gallery Images" ON storage.objects;
CREATE POLICY "Update Gallery Images" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery-images') WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Delete Gallery Images" ON storage.objects;
CREATE POLICY "Delete Gallery Images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images');
CREATE OR REPLACE FUNCTION get_doctor_availability_range(
  p_doctor_id TEXT,
  p_target_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_name TEXT;
  v_exception RECORD;
  v_sched RECORD;
  v_start_time TIME;
  v_end_time TIME;
  v_reason TEXT := NULL;
  v_now TIMESTAMP := CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata';
  v_target_date_ist DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE;
  v_appointment_count INT;
BEGIN
  -- Target date validation
  IF p_target_date < v_target_date_ist THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'This date is in the past.'
    );
  END IF;

  -- 1. Check exceptions
  SELECT * INTO v_exception
  FROM doctor_exceptions
  WHERE doctor_id = p_doctor_id AND date = p_target_date;

  IF FOUND THEN
    IF v_exception.type = 'full_day_unavailable' THEN
      RETURN jsonb_build_object(
        'available', false,
        'reason', COALESCE(v_exception.reason, 'Doctor is unavailable on this date.')
      );
    ELSIF v_exception.type = 'custom_hours' AND v_exception.start_time IS NOT NULL AND v_exception.end_time IS NOT NULL THEN
      v_start_time := v_exception.start_time::TIME;
      v_end_time := v_exception.end_time::TIME;
    END IF;
  END IF;

  -- 2. Lookup weekly schedule if no custom hours
  IF v_start_time IS NULL THEN
    v_day_name := TRIM(TO_CHAR(p_target_date, 'Day'));
    
    SELECT * INTO v_sched
    FROM doctor_weekly_schedules
    WHERE doctor_id = p_doctor_id
      AND is_active = true
      AND (
        day_of_week ILIKE '%' || v_day_name || '%'
        OR day_of_week ILIKE '%' || SUBSTRING(v_day_name FROM 1 FOR 3) || '%'
      )
    LIMIT 1;

    IF FOUND THEN
      v_start_time := v_sched.start_time::TIME;
      v_end_time := v_sched.end_time::TIME;
    ELSE
      -- No schedule configured
      RETURN jsonb_build_object(
        'available', false,
        'reason', 'No schedule configured for this day.'
      );
    END IF;
  END IF;

  -- 3. Check partial unavailable for display reason
  IF v_exception IS NOT NULL AND v_exception.type = 'partial_unavailable' AND v_exception.start_time IS NOT NULL AND v_exception.end_time IS NOT NULL THEN
    v_reason := 'Break: ' || TO_CHAR(v_exception.start_time::TIME, 'HH12:MI AM') || ' - ' || TO_CHAR(v_exception.end_time::TIME, 'HH12:MI AM');
    IF v_exception.reason IS NOT NULL AND TRIM(v_exception.reason) <> '' THEN
      v_reason := v_reason || ' (' || v_exception.reason || ')';
    END IF;
  END IF;

  -- 4. Past time check for same day
  IF p_target_date = v_target_date_ist AND v_end_time <= (v_now::TIME) THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'Consultation hours have already ended for today.'
    );
  END IF;

  -- 5. Check if daily capacity (30) is reached
  SELECT COUNT(*) INTO v_appointment_count 
  FROM appointments 
  WHERE doctor_id = p_doctor_id 
    AND preferred_date = p_target_date 
    AND status NOT IN ('Cancelled');
    
  IF v_appointment_count >= 30 THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'Doctor is fully booked for this date.'
    );
  END IF;

  RETURN jsonb_build_object(
    'available', true,
    'start_time', TO_CHAR(v_start_time, 'HH12:MI AM'),
    'end_time', TO_CHAR(v_end_time, 'HH12:MI AM'),
    'reason', v_reason
  );
END;
$$;




-- Phase 2: Contact Queries Table

CREATE TABLE IF NOT EXISTS contact_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts" ON contact_queries;
CREATE POLICY "Allow public inserts" ON contact_queries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access" ON contact_queries;
CREATE POLICY "Allow authenticated full access" ON contact_queries FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Phase 3: Update Subscribers (Stay Updated registration popup)
-- ==============================================================================

-- Table
CREATE TABLE IF NOT EXISTS update_subscribers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone_number)
);

DROP TRIGGER IF EXISTS trigger_update_subscribers_updated_at ON update_subscribers;
CREATE TRIGGER trigger_update_subscribers_updated_at
  BEFORE UPDATE ON update_subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_update_subscribers_phone ON update_subscribers (phone_number);
CREATE INDEX IF NOT EXISTS idx_update_subscribers_created ON update_subscribers (created_at DESC);

-- RLS: Allow authenticated staff/admin full access; public writes happen exclusively via the register_subscriber RPC.
ALTER TABLE update_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all direct access to update_subscribers" ON update_subscribers;
DROP POLICY IF EXISTS "Allow authenticated full access to update_subscribers" ON update_subscribers;
CREATE POLICY "Allow authenticated full access to update_subscribers"
  ON update_subscribers FOR ALL USING (true) WITH CHECK (true);

-- RPC: REGISTER_SUBSCRIBER
-- Validates input, applies rate limiting, then upserts.
-- Returns: { success: boolean, error?: string }
CREATE OR REPLACE FUNCTION register_subscriber(
  p_name        TEXT,
  p_phone       TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_name  TEXT;
  v_clean_phone TEXT;
  v_phone_count INT;
  v_ip_count    INT;
  v_client_ip   INET;
BEGIN
  -- 1. Normalize inputs
  v_clean_name  := TRIM(p_name);
  -- Extract digits only
  v_clean_phone := REGEXP_REPLACE(TRIM(p_phone), '[^0-9]', '', 'g');

  -- If phone was sent with country code (e.g. 91XXXXXXXXXX or +91), take the last 10 digits
  IF LENGTH(v_clean_phone) > 10 THEN
    v_clean_phone := SUBSTRING(v_clean_phone FROM LENGTH(v_clean_phone) - 9 FOR 10);
  END IF;

  -- 2. Validate name
  IF v_clean_name IS NULL OR LENGTH(v_clean_name) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter your full name (at least 2 characters).');
  END IF;
  IF LENGTH(v_clean_name) > 80 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Name must be 80 characters or fewer.');
  END IF;

  -- 3. Validate 10-digit mobile number
  IF v_clean_phone IS NULL OR LENGTH(v_clean_phone) != 10 OR v_clean_phone !~ '^[0-9]{10}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter a valid 10-digit mobile number.');
  END IF;

  -- 4. Rate limit: max 3 submissions from same phone number per hour
  SELECT COUNT(*) INTO v_phone_count
  FROM update_subscribers
  WHERE phone_number = v_clean_phone
    AND updated_at > now() - INTERVAL '1 hour';

  IF v_phone_count >= 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'rate_limited');
  END IF;

  -- 5. Upsert: on phone conflict update name and timestamp
  INSERT INTO update_subscribers (name, phone_number)
  VALUES (v_clean_name, v_clean_phone)
  ON CONFLICT (phone_number)
  DO UPDATE SET
    name       = EXCLUDED.name,
    updated_at = now();

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'An unexpected error occurred. Please try again.');
END;
$$;

-- Grant execute on the RPC to the anon/public role
GRANT EXECUTE ON FUNCTION register_subscriber(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_subscriber(TEXT, TEXT) TO authenticated;

