const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { isEmailConfigured } = require('../config/notifications');
const {
  listNotificationsAdmin,
  broadcastAnnouncement,
  runAllReminderJobs,
} = require('../services/notificationService');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

router.get('/notifications', async (req, res) => {
  try {
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const limit = Math.min(200, parseInt(String(req.query.limit), 10) || 80);
    const notifications = await listNotificationsAdmin({ limit, type });
    res.json({ notifications });
  } catch (err) {
    console.error('admin list notifications:', err.message);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.get('/notifications/system-status', async (_req, res) => {
  res.json({
    emailConfigured: isEmailConfigured(),
    reminderJobs: ['appointment_reminder', 'vaccination_alert'],
  });
});

router.post('/notifications/broadcast', async (req, res) => {
  const { title, message, role, sendEmail } = req.body || {};
  try {
    const result = await broadcastAnnouncement({
      title,
      message,
      roleFilter: role || 'all',
      sendEmail: sendEmail !== false,
    });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('admin broadcast:', err.message);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

router.post('/notifications/run-reminders', async (_req, res) => {
  try {
    const result = await runAllReminderJobs();
    res.json({
      message: 'Reminder jobs completed',
      ...result,
    });
  } catch (err) {
    console.error('admin run reminders:', err.message);
    res.status(500).json({ error: 'Failed to run reminders' });
  }
});

module.exports = router;
