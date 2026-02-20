const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test_db',
  password: '1234',
  port: 5432,
});

async function updateUserToAdmin() {
  const email = process.argv[2]; // Get email from command line argument

  if (!email) {
    console.log('Usage: node update-user-role.js <email>');
    console.log('Example: node update-user-role.js test@example.com');
    process.exit(1);
  }

  try {
    // Check if user exists
    const checkResult = await pool.query(
      'SELECT * FROM auth_users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length === 0) {
      console.log(`User with email ${email} not found!`);
      process.exit(1);
    }

    // Update user role to admin
    const updateResult = await pool.query(
      "UPDATE auth_users SET role = 'admin' WHERE email = $1 RETURNING id, email, full_name, role",
      [email]
    );

    console.log('User role updated successfully!');
    console.log('User Details:', updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await pool.end();
  }
}

updateUserToAdmin();
