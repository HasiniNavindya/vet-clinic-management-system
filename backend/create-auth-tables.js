const pool = require('./db');

async function createAuthTables() {
  try {
    // Create users table for authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(20),
        address TEXT,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ auth_users table created successfully');

    // Create pets_owned table (for pet owners)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets_owned (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
        pet_name VARCHAR(255) NOT NULL,
        species VARCHAR(100),
        breed VARCHAR(100),
        age_or_dob VARCHAR(50),
        gender VARCHAR(20),
        vaccination_status VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ pets_owned table created successfully');

    // Create user_preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
        vaccination_reminders BOOLEAN DEFAULT true,
        appointment_updates BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ user_preferences table created successfully');

    console.log('\n✅ All authentication tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createAuthTables();
