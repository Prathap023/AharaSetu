const Rating = require('../models/Rating');
const FoodListing = require('../models/FoodListing');

// Submit or update a rating
exports.submitRating = async (req, res) => {
  const { stars, comment } = req.body;
  const { listingId } = req.params;

  try {
    const food = await FoodListing.findById(listingId);
    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.status !== 'completed')
      return res.status(400).json({ message: 'Can only rate completed transactions' });
    if (food.claimedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized to rate this transaction' });

    // Upsert — create or update
    const rating = await Rating.findOneAndUpdate(
  { foodListing: listingId, volunteer: req.user.id },
  {
    stars,
    comment,
    restaurant: food.postedBy,
    foodListing: listingId,
    volunteer: req.user.id,
  },
  {
    upsert: true,
    returnDocument: 'after',
  }
);

    res.json({ message: 'Rating saved!', rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get rating for a specific transaction by this volunteer
exports.getMyRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      foodListing: req.params.listingId,
      volunteer: req.user.id
    });
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all ratings for a restaurant (for My Listings page)
exports.getRestaurantRatings = async (req, res) => {
  try {

    const ratings = await Rating.find({
      foodListing: req.params.restaurantId
    })
      .populate('volunteer', 'name')
      .populate('foodListing', 'title')
      .sort({ createdAt: -1 });

    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : null;

    res.json({
      ratings,
      average: avg,
      total: ratings.length
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get average rating for a restaurant (for Home page)
exports.getRestaurantAverage = async (req, res) => {
  try {
    const ratings = await Rating.find({ restaurant: req.params.restaurantId });
    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : null;
    res.json({ average: avg, total: ratings.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all ratings for admin
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('volunteer', 'name email')
      .populate('restaurant', 'name email')
      .populate('foodListing', 'title')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};