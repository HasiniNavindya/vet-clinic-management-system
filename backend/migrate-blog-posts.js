const pool = require('./db');

async function migrateBlogPosts() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(200) NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        image VARCHAR(1000) NOT NULL DEFAULT '',
        author VARCHAR(200) NOT NULL DEFAULT '',
        category VARCHAR(50) NOT NULL DEFAULT 'news',
        read_time VARCHAR(50) NOT NULL DEFAULT '5 min read',
        published_at TIMESTAMP,
        is_published BOOLEAN NOT NULL DEFAULT false,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        created_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ blog_posts table ready');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_published
      ON blog_posts (is_published, published_at DESC)
    `);

    console.log('✓ Blog posts are created by admins via /dashboard/admin/blog (no sample seed)');

    console.log('\n✅ Blog migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Blog migration failed:', error);
    process.exit(1);
  }
}

migrateBlogPosts();
