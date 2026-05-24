const express = require('express');
const { getHomeStats } = require('../services/homeStatsService');

const router = express.Router();

router.get('/home-stats', async (_req, res) => {
  try {
    const stats = await getHomeStats();
    res.json(stats);
  } catch (err) {
    console.error('Public home stats error:', err);
    res.status(500).json({ error: 'Failed to load statistics' });
  }
});

module.exports = router;
