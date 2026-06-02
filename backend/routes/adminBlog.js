const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

const BLOG_CATEGORIES = ['health', 'nutrition', 'training', 'lifestyle', 'news'];

function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function normalizeCategory(cat) {
  const c = String(cat || 'news').toLowerCase();
  return BLOG_CATEGORIES.includes(c) ? c : 'news';
}

function mapPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    author: row.author,
    publishedAt: row.published_at,
    category: row.category,
    readTime: row.read_time,
    isPublished: row.is_published === true,
    isFeatured: row.is_featured === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function uniqueSlug(base, excludeId) {
  let slug = base || 'post';
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q = excludeId
      ? await pool.query('SELECT id FROM blog_posts WHERE slug = $1 AND id <> $2', [candidate, excludeId])
      : await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [candidate]);
    if (q.rows.length === 0) return candidate;
    n += 1;
  }
}

router.get('/blog/posts', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, slug, title, excerpt, content, image, author, category, read_time,
              published_at, is_published, is_featured, created_at, updated_at
       FROM blog_posts ORDER BY COALESCE(published_at, created_at) DESC, id DESC`
    );
    res.json({ posts: r.rows.map(mapPost), categories: BLOG_CATEGORIES });
  } catch (err) {
    console.error('adminBlog list:', err.message);
    res.status(500).json({ error: 'Failed to list blog posts' });
  }
});

router.post('/blog/posts', async (req, res) => {
  const {
    title,
    excerpt,
    content,
    image,
    author,
    category,
    readTime,
    publishedAt,
    isPublished,
    isFeatured,
    slug: slugInput,
  } = req.body || {};

  if (!title || !excerpt) {
    return res.status(400).json({ error: 'title and excerpt are required' });
  }

  try {
    const baseSlug = slugInput ? slugify(slugInput) : slugify(title);
    const slug = await uniqueSlug(baseSlug);
    const published = isPublished === true;
    const pubAt = publishedAt ? new Date(publishedAt) : published ? new Date() : null;

    if (isFeatured === true) {
      await pool.query('UPDATE blog_posts SET is_featured = false');
    }

    const r = await pool.query(
      `INSERT INTO blog_posts (
        slug, title, excerpt, content, image, author, category, read_time,
        published_at, is_published, is_featured, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        slug,
        title,
        excerpt,
        content || '',
        image || '',
        author || 'Carlisle Pet Care',
        normalizeCategory(category),
        readTime || '5 min read',
        pubAt,
        published,
        isFeatured === true,
        req.user?.id || null,
      ]
    );
    res.status(201).json({ post: mapPost(r.rows[0]) });
  } catch (err) {
    console.error('adminBlog create:', err.message);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

router.patch('/blog/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const {
    title,
    excerpt,
    content,
    image,
    author,
    category,
    readTime,
    publishedAt,
    isPublished,
    isFeatured,
    slug: slugInput,
  } = req.body || {};

  try {
    const exists = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (exists.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    if (isFeatured === true) {
      await pool.query('UPDATE blog_posts SET is_featured = false WHERE id <> $1', [id]);
    }

    const sets = ['updated_at = CURRENT_TIMESTAMP'];
    const vals = [];
    let p = 1;

    if (slugInput !== undefined) {
      const base = slugify(slugInput);
      sets.push(`slug = $${p++}`);
      vals.push(await uniqueSlug(base, id));
    }
    if (title !== undefined) {
      sets.push(`title = $${p++}`);
      vals.push(title);
    }
    if (excerpt !== undefined) {
      sets.push(`excerpt = $${p++}`);
      vals.push(excerpt);
    }
    if (content !== undefined) {
      sets.push(`content = $${p++}`);
      vals.push(content);
    }
    if (image !== undefined) {
      sets.push(`image = $${p++}`);
      vals.push(image);
    }
    if (author !== undefined) {
      sets.push(`author = $${p++}`);
      vals.push(author);
    }
    if (category !== undefined) {
      sets.push(`category = $${p++}`);
      vals.push(normalizeCategory(category));
    }
    if (readTime !== undefined) {
      sets.push(`read_time = $${p++}`);
      vals.push(readTime);
    }
    if (publishedAt !== undefined) {
      sets.push(`published_at = $${p++}`);
      vals.push(publishedAt ? new Date(publishedAt) : null);
    }
    if (isPublished !== undefined) {
      sets.push(`is_published = $${p++}`);
      vals.push(Boolean(isPublished));
      if (isPublished === true && publishedAt === undefined && !exists.rows[0].published_at) {
        sets.push(`published_at = $${p++}`);
        vals.push(new Date());
      }
    }
    if (isFeatured !== undefined) {
      sets.push(`is_featured = $${p++}`);
      vals.push(Boolean(isFeatured));
    }

    if (sets.length === 1) return res.status(400).json({ error: 'No updates provided' });

    vals.push(id);
    const r = await pool.query(
      `UPDATE blog_posts SET ${sets.join(', ')} WHERE id = $${p} RETURNING *`,
      vals
    );
    res.json({ post: mapPost(r.rows[0]) });
  } catch (err) {
    console.error('adminBlog patch:', err.message);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

router.delete('/blog/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const r = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('adminBlog delete:', err.message);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

module.exports = router;
