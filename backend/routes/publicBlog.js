const express = require('express');
const pool = require('../db');

const router = express.Router();

function mapPost(row, includeContent = false) {
  const post = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    author: row.author,
    publishedAt: row.published_at,
    category: row.category,
    readTime: row.read_time,
    isFeatured: row.is_featured === true,
  };
  if (includeContent) post.content = row.content;
  return post;
}

router.get('/blog-posts', async (req, res) => {
  try {
    const limit = req.query.limit ? Number.parseInt(String(req.query.limit), 10) : null;
    const category = req.query.category ? String(req.query.category).toLowerCase() : null;

    let sql = `
      SELECT id, slug, title, excerpt, content, image, author, category, read_time,
             published_at, is_featured
      FROM blog_posts
      WHERE is_published = true`;
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY is_featured DESC, published_at DESC NULLS LAST, id DESC';

    if (limit && limit > 0) {
      params.push(limit);
      sql += ` LIMIT $${params.length}`;
    }

    const r = await pool.query(sql, params);
    res.json({ posts: r.rows.map((row) => mapPost(row)) });
  } catch (err) {
    console.error('Load blog posts error:', err);
    res.status(500).json({ error: 'Failed to load blog posts' });
  }
});

router.get('/blog-posts/:slug', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, slug, title, excerpt, content, image, author, category, read_time,
              published_at, is_featured
       FROM blog_posts
       WHERE slug = $1 AND is_published = true`,
      [req.params.slug]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: mapPost(r.rows[0], true) });
  } catch (err) {
    console.error('Load blog post error:', err);
    res.status(500).json({ error: 'Failed to load blog post' });
  }
});

module.exports = router;
