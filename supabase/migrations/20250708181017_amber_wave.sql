-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function for checking if current user is a doctor
CREATE OR REPLACE FUNCTION is_current_user_doctor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'doctor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user setup
CREATE OR REPLACE FUNCTION handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used for any additional user setup logic
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role text NOT NULL CHECK (role = ANY (ARRAY['patient'::text, 'doctor'::text])),
      full_name text NOT NULL,
      phone text,
      date_of_birth date,
      location text,
      membership_type text DEFAULT 'Free'::text CHECK (membership_type = ANY (ARRAY['Free'::text, 'Premium'::text, 'Pro'::text])),
      created_at timestamptz DEFAULT now(),
      CONSTRAINT unique_user_profile UNIQUE (user_id)
    );
  END IF;
END $$;

-- Add missing columns to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'membership_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN membership_type text DEFAULT 'Free'::text;
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_membership_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_membership_type_check 
    CHECK (membership_type = ANY (ARRAY['Free'::text, 'Premium'::text, 'Pro'::text]));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role = ANY (ARRAY['patient'::text, 'doctor'::text]));
  END IF;
END $$;

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Doctors can read all profiles'
  ) THEN
    CREATE POLICY "Doctors can read all profiles"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (is_current_user_doctor());
  END IF;
END $$;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  analytics_enabled boolean DEFAULT true,
  sound_enabled boolean DEFAULT true,
  haptics_enabled boolean DEFAULT true,
  auto_save boolean DEFAULT true,
  high_quality_images boolean DEFAULT true,
  language text DEFAULT 'English (US)'::text,
  theme text DEFAULT 'system'::text CHECK (theme = ANY (ARRAY['system'::text, 'light'::text, 'dark'::text, 'auto'::text])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- Create indexes for user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create policies for user_settings (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  age integer,
  gender text,
  weight numeric,
  height numeric,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_patient UNIQUE (user_id)
);

-- Create indexes for patients
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Enable RLS on patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies for patients (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Patients can insert own data" ON patients;
DROP POLICY IF EXISTS "Patients can read own data" ON patients;
DROP POLICY IF EXISTS "Patients can update own data" ON patients;
DROP POLICY IF EXISTS "Doctors can read patient data" ON patients;

CREATE POLICY "Patients can insert own data"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can read own data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own data"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can read patient data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (is_current_user_doctor());

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  specialization text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_doctor UNIQUE (user_id)
);

-- Create indexes for doctors
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

-- Enable RLS on doctors
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Doctors can insert own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can read own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own data" ON doctors;

CREATE POLICY "Doctors can insert own data"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can read own data"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update own data"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  condition text NOT NULL,
  confidence numeric(5,2) NOT NULL,
  severity text NOT NULL CHECK (severity = ANY (ARRAY['Low'::text, 'Moderate'::text, 'High'::text])),
  image_url text NOT NULL,
  body_part text NOT NULL,
  description text NOT NULL,
  care_advice text[] NOT NULL,
  risk_level text NOT NULL,
  symptoms text[],
  treatment_options text[],
  created_at timestamptz DEFAULT now()
);

-- Create indexes for scans
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_condition ON scans(condition);
CREATE INDEX IF NOT EXISTS idx_scans_severity ON scans(severity);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);

-- Enable RLS on scans
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policies for scans (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own scans" ON scans;
DROP POLICY IF EXISTS "Users can insert own scans" ON scans;
DROP POLICY IF EXISTS "Users can update own scans" ON scans;
DROP POLICY IF EXISTS "Users can delete own scans" ON scans;

CREATE POLICY "Users can view own scans"
  ON scans
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scans
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON scans
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON scans
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Create health_submissions table
CREATE TABLE IF NOT EXISTS health_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text])),
  submitted_at timestamptz DEFAULT now()
);

-- Create indexes for health_submissions
CREATE INDEX IF NOT EXISTS idx_health_submissions_patient_id ON health_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_submissions_status ON health_submissions(status);
CREATE INDEX IF NOT EXISTS idx_health_submissions_submitted_at ON health_submissions(submitted_at);

-- Enable RLS on health_submissions
ALTER TABLE health_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for health_submissions (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Patients can insert own submissions" ON health_submissions;
DROP POLICY IF EXISTS "Patients can read own submissions" ON health_submissions;
DROP POLICY IF EXISTS "Doctors can read all submissions" ON health_submissions;
DROP POLICY IF EXISTS "Doctors can update submission status" ON health_submissions;

CREATE POLICY "Patients can insert own submissions"
  ON health_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = health_submissions.patient_id 
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Patients can read own submissions"
  ON health_submissions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = health_submissions.patient_id 
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can read all submissions"
  ON health_submissions
  FOR SELECT
  TO authenticated
  USING (is_current_user_doctor());

CREATE POLICY "Doctors can update submission status"
  ON health_submissions
  FOR UPDATE
  TO authenticated
  USING (is_current_user_doctor());

-- Create risk_predictions table
CREATE TABLE IF NOT EXISTS risk_predictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id uuid REFERENCES health_submissions(id) ON DELETE CASCADE NOT NULL,
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_category text NOT NULL CHECK (risk_category = ANY (ARRAY['low'::text, 'moderate'::text, 'critical'::text])),
  generated_at timestamptz DEFAULT now()
);

-- Create indexes for risk_predictions
CREATE INDEX IF NOT EXISTS idx_risk_predictions_submission_id ON risk_predictions(submission_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_category ON risk_predictions(risk_category);

-- Enable RLS on risk_predictions
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for risk_predictions (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "System can insert predictions" ON risk_predictions;
DROP POLICY IF EXISTS "Patients can read own predictions" ON risk_predictions;
DROP POLICY IF EXISTS "Doctors can read all predictions" ON risk_predictions;

CREATE POLICY "System can insert predictions"
  ON risk_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Patients can read own predictions"
  ON risk_predictions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM health_submissions
    JOIN patients ON patients.id = health_submissions.patient_id
    WHERE health_submissions.id = risk_predictions.submission_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can read all predictions"
  ON risk_predictions
  FOR SELECT
  TO authenticated
  USING (is_current_user_doctor());

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id uuid REFERENCES health_submissions(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['lifestyle'::text, 'clinical'::text])),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_submission_id ON recommendations(submission_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_doctor_id ON recommendations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type);

-- Enable RLS on recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for recommendations (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "System can insert recommendations" ON recommendations;
DROP POLICY IF EXISTS "Doctors can insert recommendations" ON recommendations;
DROP POLICY IF EXISTS "Doctors can update recommendations" ON recommendations;
DROP POLICY IF EXISTS "Doctors can read all recommendations" ON recommendations;
DROP POLICY IF EXISTS "Patients can read own recommendations" ON recommendations;

CREATE POLICY "System can insert recommendations"
  ON recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Doctors can insert recommendations"
  ON recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_doctor());

CREATE POLICY "Doctors can update recommendations"
  ON recommendations
  FOR UPDATE
  TO authenticated
  USING (is_current_user_doctor());

CREATE POLICY "Doctors can read all recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (is_current_user_doctor());

CREATE POLICY "Patients can read own recommendations"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM health_submissions
    JOIN patients ON patients.id = health_submissions.patient_id
    WHERE health_submissions.id = recommendations.submission_id
    AND patients.user_id = auth.uid()
  ));