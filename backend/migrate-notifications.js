const pool = require('./db');

async function migrateNotifications() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link_path VARCHAR(500),
        reference_type VARCHAR(50),
        reference_id INTEGER,
        is_read BOOLEAN NOT NULL DEFAULT false,
        email_sent BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ notifications table ready');

    await pool.query(`
      ALTER TABLE user_preferences
      ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true
    `);
    console.log('✓ user_preferences.email_notifications ready');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
      ON notifications(user_id, is_read, created_at DESC)
    `);

    console.log('\n✅ Notification migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Notification migration failed:', error);
    process.exit(1);
  }
}

migrateNotifications();
