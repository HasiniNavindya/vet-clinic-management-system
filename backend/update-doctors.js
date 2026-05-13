const pool = require('./db');

async function updateDoctors() {
  try {
    // Update existing doctors and add new ones
    await pool.query(`
      INSERT INTO doctors (name, specialization, email, phone, image_url, bio, available_days)
      VALUES 
        ('Linda Johns', 'Cardiologist', 'linda.johns@clinic.com', '+1234567894', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', 'Heart and cardiovascular health expert with 15 years experience', ARRAY['Monday', 'Tuesday', 'Thursday', 'Friday']),
        ('Sarah Smith', 'Surgeon', 'sarah.smith@clinic.com', '+1234567895', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', 'Specialized veterinary surgeon with 12 years of experience', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Friday']),
        ('Jim Lucada', 'Therapist', 'jim.lucada@clinic.com', '+1234567891', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', 'Expert in behavioral therapy and rehabilitation with 10 years experience', ARRAY['Tuesday', 'Thursday', 'Saturday']),
        ('Maria Petrova', 'Allergist', 'maria.petrova@clinic.com', '+1234567890', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', 'Specialized in pet allergies and immune system disorders with 8 years experience', ARRAY['Monday', 'Wednesday', 'Friday']),
        ('Mike Johnson', 'Nutritionist', 'mike.johnson@clinic.com', '+1234567896', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80', 'Pet nutrition and diet planning specialist with 7 years experience', ARRAY['Monday', 'Wednesday', 'Thursday', 'Friday']),
        ('Emily Chen', 'Dermatologist', 'emily.chen@clinic.com', '+1234567897', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', 'Skin and coat health specialist with 9 years experience', ARRAY['Tuesday', 'Wednesday', 'Thursday', 'Friday'])
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        specialization = EXCLUDED.specialization,
        phone = EXCLUDED.phone,
        image_url = EXCLUDED.image_url,
        bio = EXCLUDED.bio,
        available_days = EXCLUDED.available_days
    `);
    console.log('✓ Doctors updated successfully');

    // Display all doctors
    const result = await pool.query('SELECT id, name, specialization, email FROM doctors ORDER BY name');
    console.log('\n📋 Current doctors in database:');
    result.rows.forEach(doc => {
      console.log(`  ${doc.id}. ${doc.name} - ${doc.specialization} (${doc.email})`);
    });

    await pool.end();
    console.log('\n✅ Database updated successfully!');
  } catch (error) {
    console.error('❌ Error updating doctors:', error);
    process.exit(1);
  }
}

updateDoctors();
