const pool = require('./db');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'password123';
    const fullName = 'Test User';

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM auth_users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ Test user already exists:', email);
      console.log('   Email: test@example.com');
      console.log('   Password: password123');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert test user
    const result = await pool.query(
      `INSERT INTO auth_users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName, 'user']
    );

    console.log('✅ Test user created successfully!');
    console.log('\nLogin credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\nUser details:', result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
