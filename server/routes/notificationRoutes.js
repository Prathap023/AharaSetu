const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  deleteAll
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllRead);
router.put('/mark-read/:id', protect, markOneRead);
router.delete('/delete-all', protect, deleteAll);

module.exports = router;