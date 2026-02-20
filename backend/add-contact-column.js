const pool = require('./db');

async function addContactNumberColumn() {
  try {
    // Check if column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='pets' AND column_name='contact_number'
    `);

    if (checkColumn.rows.length === 0) {
      // Column doesn't exist, add it
      await pool.query(`
        ALTER TABLE pets 
        ADD COLUMN contact_number VARCHAR(20)
      `);
      console.log('✓ contact_number column added to pets table');
    } else {
      console.log('✓ contact_number column already exists');
    }

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

addContactNumberColumn();
