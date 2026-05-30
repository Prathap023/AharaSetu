const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getProfileStats,
  requestRoleChange,
  getMyRoleRequest,
  getAllRoleRequests,
  handleRoleRequest,
} = require('../controllers/profileController');

router.get('/stats', protect, getProfileStats);
router.post('/role-request', protect, requestRoleChange);
router.get('/role-request/my', protect, getMyRoleRequest);
router.get('/role-requests/all', protect, adminOnly, getAllRoleRequests);
router.put('/role-request/:id', protect, adminOnly, handleRoleRequest);

module.exports = router;