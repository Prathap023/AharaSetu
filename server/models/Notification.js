const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'new_listing',
      'listing_approved',
      'listing_rejected',
      'new_claim',
      'claim_approved',
      'claim_rejected',
      'payment_received',
      'both_acknowledged',
      'transaction_completed'
    ]
  },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);