const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  quantity: String,
  expiryTime: Date,
  type: { type: String, enum: ['free', 'paid'], default: 'free' },
  price: { type: Number, default: 0 },

  // Location and contact
  address: { type: String, required: true },
  phone: { type: String, required: true },
  contactEmail: { type: String, required: true },

  // Admin approval
  adminApproved: { type: Boolean, default: false },
  adminRejected: { type: Boolean, default: false },

  // Claim and payment
  status: {
    type: String,
    enum: [
      'available',
      'pending_payment',
      'pending_restaurant_approval',
      'approved',
      'rejected',
      'claimed',
      'completed'
    ],
    default: 'available'
  },

  // Payment
  paymentDone: { type: Boolean, default: false },
  paymentId: { type: String },
  paymentIntentId: { type: String },

  // Restaurant claim approval
  restaurantApproved: { type: Boolean, default: false },
  restaurantRejected: { type: Boolean, default: false },

  // Partial claim fields
  quantityUnit: { type: String, enum: ['plates', 'kg'], default: 'plates' },
  quantityNumber: { type: Number, default: 0 },
  remainingQuantity: { type: Number, default: 0 },
  claimedQuantity: { type: Number, default: 0 },

  // ✅ NEW: Acknowledgement fields
  restaurantProvided: { type: Boolean, default: false },
  volunteerPickedUp: { type: Boolean, default: false },
  adminCompleted: { type: Boolean, default: false },

  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FoodListing', foodSchema);