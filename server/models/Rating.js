const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  foodListing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FoodListing', 
    required: true 
  },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  volunteer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  stars: { 
    type: Number, 
    min: 1, max: 5, 
    required: true 
  },
  comment: { 
    type: String, 
    maxlength: 300 
  },
}, { timestamps: true });

// One rating per transaction
ratingSchema.index({ foodListing: 1, volunteer: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);