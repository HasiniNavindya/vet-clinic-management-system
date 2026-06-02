const pool = require('./db');

async function createDashboardTables() {
  try {
    // Create doctors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        image_url TEXT,
        bio TEXT,
        available_days TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ doctors table created successfully');

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
        pet_id INTEGER REFERENCES pets_owned(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ appointments table created successfully');

    console.log('\n✅ All dashboard tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createDashboardTables();
