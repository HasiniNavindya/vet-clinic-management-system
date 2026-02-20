const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test_db',
  password: '1234',
  port: 5432,
});

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const checkResult = await pool.query(
      'SELECT * FROM auth_users WHERE email = $1',
      ['admin@carlisle.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Email: admin@carlisle.com');
      console.log('You can update the role if needed.');
      
      // Update role to admin if it's not already
      await pool.query(
        "UPDATE auth_users SET role = 'admin' WHERE email = $1",
        ['admin@carlisle.com']
      );
      console.log('Role updated to admin.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert admin user
    const insertResult = await pool.query(
      `INSERT INTO auth_users (email, password_hash, full_name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, full_name, role`,
      ['admin@carlisle.com', hashedPassword, 'Admin User', 'admin']
    );

    console.log('Admin user created successfully!');
    console.log('Email: admin@carlisle.com');
    console.log('Password: admin123');
    console.log('User Details:', insertResult.rows[0]);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
