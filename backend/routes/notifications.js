const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  processAppointmentReminders,
} = require('../services/notificationService');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const list = await listNotifications(req.user.id, {
      unreadOnly,
      limit: Number(req.query.limit) || 50,
    });
    res.json(list);
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const updated = await markAsRead(Number(req.params.id), req.user.id);
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await markAllRead(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

router.post(
  '/process-reminders',
  authenticateToken,
  requireRole('admin', 'doctor', 'staff'),
  async (req, res) => {
    try {
      const appointmentReminders = await processAppointmentReminders();
      res.json({
        message: 'Reminder processing completed',
        appointmentReminders,
      });
    } catch (err) {
      console.error('Process reminders error:', err);
      res.status(500).json({ error: 'Failed to process reminders' });
    }
  }
);

module.exports = router;
