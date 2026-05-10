const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  submitRating,
  getMyRating,
  getRestaurantRatings,
  getRestaurantAverage,
  getAllRatings
} = require('../controllers/ratingController');

// Volunteer routes
router.post('/listing/:listingId', protect, submitRating);
router.get('/my-rating/:listingId', protect, getMyRating);

// Restaurant route
router.get('/restaurant/:restaurantId', protect, getRestaurantRatings);

// Public route (for home page)
router.get('/average/:restaurantId', getRestaurantAverage);

// Admin route
router.get('/admin/all', protect, adminOnly, getAllRatings);

module.exports = router;