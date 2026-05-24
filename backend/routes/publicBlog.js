const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const postsPath = path.join(__dirname, '../data/blog-posts.json');

function loadPosts() {
  const raw = fs.readFileSync(postsPath, 'utf8');
  const posts = JSON.parse(raw);
  return posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

router.get('/blog-posts', (req, res) => {
  try {
    let posts = loadPosts();
    const limit = req.query.limit ? Number.parseInt(String(req.query.limit), 10) : null;
    if (limit && limit > 0) {
      posts = posts.slice(0, limit);
    }
    res.json({ posts });
  } catch (err) {
    console.error('Load blog posts error:', err);
    res.status(500).json({ error: 'Failed to load blog posts' });
  }
});

router.get('/blog-posts/:slug', (req, res) => {
  try {
    const post = loadPosts().find((p) => p.slug === req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post });
  } catch (err) {
    console.error('Load blog post error:', err);
    res.status(500).json({ error: 'Failed to load blog post' });
  }
});

module.exports = router;
