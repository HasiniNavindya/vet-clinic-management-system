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

    // Insert some sample doctors
    await pool.query(`
      INSERT INTO doctors (name, specialization, email, phone, image_url, bio, available_days)
      VALUES 
        ('Maria Petrova', 'Allergist', 'maria.petrova@clinic.com', '+1234567890', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', 'Specialized in pet allergies and immune system disorders', ARRAY['Monday', 'Wednesday', 'Friday']),
        ('Jim Lucada', 'Therapist', 'jim.lucada@clinic.com', '+1234567891', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', 'Expert in behavioral therapy and rehabilitation', ARRAY['Tuesday', 'Thursday', 'Saturday']),
        ('Damon Last', 'Surgeon', 'damon.last@clinic.com', '+1234567892', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80', 'Experienced veterinary surgeon with 15+ years', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        ('Olga Niko', 'Nutritionist', 'olga.niko@clinic.com', '+1234567893', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', 'Pet nutrition and diet planning specialist', ARRAY['Monday', 'Wednesday', 'Thursday']),
        ('Linda Johns', 'Cardiologist', 'linda.johns@clinic.com', '+1234567894', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', 'Heart and cardiovascular health expert', ARRAY['Tuesday', 'Thursday', 'Friday'])
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✓ Sample doctors inserted successfully');

    console.log('\n✅ All dashboard tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createDashboardTables();
