const pool = require('./db');

async function migrateHealthRecords() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_medical_records (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets_owned(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        visit_date DATE NOT NULL,
        diagnosis TEXT,
        treatment TEXT,
        consultation_notes TEXT,
        created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vaccinations (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets_owned(id) ON DELETE CASCADE,
        vaccine_name VARCHAR(255) NOT NULL,
        due_date DATE NOT NULL,
        administered_date DATE,
        interval_days INTEGER,
        notes TEXT,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vaccination_reminder_log (
        id SERIAL PRIMARY KEY,
        vaccination_id INTEGER NOT NULL REFERENCES vaccinations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        reminder_type VARCHAR(50) NOT NULL,
        channel VARCHAR(30) DEFAULT 'in_app',
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_due
        ON vaccinations(pet_id, due_date);

      CREATE INDEX IF NOT EXISTS idx_medical_records_pet_visit
        ON pet_medical_records(pet_id, visit_date DESC);

      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets_owned(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        prescription_number VARCHAR(64) UNIQUE NOT NULL,
        issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
        diagnosis_summary TEXT,
        general_instructions TEXT,
        document_url TEXT,
        status VARCHAR(30) DEFAULT 'active',
        created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS prescription_items (
        id SERIAL PRIMARY KEY,
        prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
        medicine_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        duration VARCHAR(100),
        instructions TEXT,
        sort_order INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_prescriptions_pet
        ON prescriptions(pet_id, issued_date DESC);
    `);

    console.log('✓ Health records tables ready (medical records, vaccinations, prescriptions)');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateHealthRecords();
