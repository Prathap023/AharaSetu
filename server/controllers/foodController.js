const { createNotification, notifyAllVolunteersAndNGOs, notifyAllAdmins } = require('../utils/createNotification');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { createPaymentIntent, confirmPaymentIntent, createRefund } = require('../utils/stripeHelper');
const {
  sendPaymentReceiptToVolunteer,
  sendPaymentNotificationToRestaurant,
  sendRefundNotification
} = require('../utils/sendEmail');

// Create listing (restaurant)
exports.createListing = async (req, res) => {
  try {
    const food = await FoodListing.create({ ...req.body, postedBy: req.user.id });

    // Notify all admins
    await notifyAllAdmins({
      message: `🍱 New food listing "${food.title}" has been posted and needs your approval!`,
      type: 'new_listing',
      listingId: food._id
    });

    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all admin approved listings
exports.getAllListings = async (req, res) => {
  try {
    const food = await FoodListing.find({
      adminApproved: true,
      adminRejected: false,
      status: 'available'
    }).populate('postedBy', 'name email phone');
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all listings for admin
exports.getAdminListings = async (req, res) => {
  try {
    const food = await FoodListing.find()
      .populate('postedBy', 'name email phone')
      .populate('claimedBy', 'name email phone');
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approve listing
exports.adminApproveListing = async (req, res) => {
  try {
    const food = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { adminApproved: true, adminRejected: false },
      { new: true }
    );

    // Notify restaurant
    await createNotification({
      recipient: food.postedBy,
      message: `✅ Your food listing "${food.title}" has been approved by admin and is now live!`,
      type: 'listing_approved',
      listingId: food._id
    });

    // Notify all volunteers and NGOs
    await notifyAllVolunteersAndNGOs({
      message: `🍱 New food available: "${food.title}"! Check it out and claim it now!`,
      type: 'new_listing',
      listingId: food._id
    });

    res.json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin reject listing
exports.adminRejectListing = async (req, res) => {
  try {
    const food = await FoodListing.findByIdAndUpdate(
      req.params.id,
      { adminRejected: true, adminApproved: false },
      { new: true }
    );

    // Notify restaurant
    await createNotification({
      recipient: food.postedBy,
      message: `❌ Your food listing "${food.title}" has been rejected by admin. Please contact admin for more details.`,
      type: 'listing_rejected',
      listingId: food._id
    });

    res.json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Claim listing (volunteer/NGO)
exports.claimListing = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (!food.adminApproved) return res.status(400).json({ message: 'Not approved by admin yet' });

    if (food.type === 'free') {
      food.status = 'pending_restaurant_approval';
      food.claimedBy = req.user.id;
      await food.save();

      // Notify restaurant
      await createNotification({
        recipient: food.postedBy,
        message: `🙏 Someone has claimed your free food listing "${food.title}"! Please approve or reject.`,
        type: 'new_claim',
        listingId: food._id
      });

      return res.json({ message: 'Claim requested! Waiting for restaurant approval.', food });
    } else {
      food.status = 'pending_payment';
      food.claimedBy = req.user.id;
      food.paymentIntentId = null;
      await food.save();

      // Notify restaurant
      await createNotification({
        recipient: food.postedBy,
        message: `💳 Someone is paying for your food listing "${food.title}"! Waiting for payment.`,
        type: 'new_claim',
        listingId: food._id
      });

      return res.json({ message: 'Proceed to payment!', food });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Confirm real Stripe payment
exports.makePayment = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id)
      .populate('postedBy', 'name email phone address')
      .populate('claimedBy', 'name email');

    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.status !== 'pending_payment') return res.status(400).json({ message: 'Payment not required' });

    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'Payment ID missing' });

    // Confirm payment with Stripe
    const paymentIntent = await confirmPaymentIntent(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Update food status first
    food.paymentDone = true;
    food.paymentId = paymentIntent.id;
    food.status = 'pending_restaurant_approval';
    await food.save();

    // Send emails separately so they don't block the response
    try {
      await sendPaymentReceiptToVolunteer({
        volunteerEmail: food.claimedBy.email,
        volunteerName: food.claimedBy.name,
        foodTitle: food.title,
        amount: food.price,
        paymentId: paymentIntent.id,
        restaurantName: food.postedBy.name,
        restaurantAddress: food.address,
        restaurantPhone: food.phone,
      });
      console.log('✅ Volunteer email sent');
    } catch (emailErr) {
      console.error('❌ Volunteer email failed:', emailErr.message);
    }

    try {
      await sendPaymentNotificationToRestaurant({
        restaurantEmail: food.contactEmail,
        restaurantName: food.postedBy.name,
        foodTitle: food.title,
        amount: food.price,
        paymentId: paymentIntent.id,
        volunteerName: food.claimedBy.name,
        volunteerEmail: food.claimedBy.email,
      });
      console.log('✅ Restaurant email sent');
    } catch (emailErr) {
      console.error('❌ Restaurant email failed:', emailErr.message);
    }

    res.json({
      message: 'Payment successful! Waiting for restaurant approval.',
      food
    });

  } catch (err) {
    console.error('Payment error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Restaurant approve claim
// Restaurant approve claim
exports.restaurantApprove = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);

    if (!food) return res.status(404).json({ message: 'Listing not found' });

    food.restaurantApproved = true;
    food.restaurantRejected = false;
    food.status = 'claimed';

    await food.save();

    // Notify volunteer
    await createNotification({
      recipient: food.claimedBy,
      message: `✅ Your claim for "${food.title}" has been approved by the restaurant! Please go pick it up.`,
      type: 'claim_approved',
      listingId: food._id
    });

    res.json({ message: 'Claim approved!', food });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Restaurant reject claim → real Stripe refund
exports.restaurantReject = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id)
      .populate('claimedBy', 'name email');

    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    // Save claimedBy before clearing it
    const claimedBy = food.claimedBy;

    // Real Stripe refund
    if (food.paymentDone && food.paymentId) {
      try {
        await createRefund(food.paymentId);
        if (claimedBy) {
          await sendRefundNotification({
            volunteerEmail: claimedBy.email,
            volunteerName: claimedBy.name,
            foodTitle: food.title,
            amount: food.price,
            paymentId: food.paymentId,
          });
        }
      } catch (refundErr) {
        console.error('Refund/email error:', refundErr.message);
        // Continue even if email fails
      }
    }

    // Notify volunteer BEFORE clearing claimedBy
    if (claimedBy) {
      await createNotification({
        recipient: claimedBy._id,
        message: `❌ Your claim for "${food.title}" has been rejected by the restaurant.${food.paymentDone ? ' Your payment has been refunded.' : ''}`,
        type: 'claim_rejected',
        listingId: food._id
      });
    }

    // Now clear the fields
    food.restaurantRejected = true;
    food.restaurantApproved = false;
    food.status = 'available';
    food.claimedBy = null;
    food.paymentDone = false;
    food.paymentId = null;
    food.paymentIntentId = null;

    await food.save();

    res.json({ message: 'Claim rejected and payment refunded!', food });
  } catch (err) {
    console.error('restaurantReject error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get restaurant's own listings
exports.getMyListings = async (req, res) => {
  try {
    const food = await FoodListing.find({ postedBy: req.user.id })
      .populate('claimedBy', 'name email phone');
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get volunteer's claimed listings
exports.getMyClaimedListings = async (req, res) => {
  try {
    const food = await FoodListing.find({ claimedBy: req.user.id })
      .populate('postedBy', 'name email phone address');
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Restaurant acknowledges food provided
exports.restaurantProvided = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (food.status !== 'claimed') return res.status(400).json({ message: 'Food not yet claimed' });
    food.restaurantProvided = true;
    await food.save();

    // Check if volunteer also picked up
    if (food.volunteerPickedUp) {
      await notifyAllAdmins({
        message: `🔔 Both restaurant and volunteer have acknowledged for "${food.title}". Please mark transaction as complete!`,
        type: 'both_acknowledged',
        listingId: food._id
      });
    }

    res.json({ message: 'Marked as provided!', food });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Volunteer acknowledges food picked up
exports.volunteerPickedUp = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.claimedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (food.status !== 'claimed') return res.status(400).json({ message: 'Food not yet claimed' });

    food.volunteerPickedUp = true;
    await food.save();

    // Check if restaurant also provided
    if (food.restaurantProvided) {
      await notifyAllAdmins({
        message: `🔔 Both restaurant and volunteer have acknowledged for "${food.title}". Please mark transaction as complete!`,
        type: 'both_acknowledged',
        listingId: food._id
      });
    }

    res.json({ message: 'Marked as picked up!', food });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin marks transaction as completed
exports.adminComplete = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (!food.restaurantProvided || !food.volunteerPickedUp)
      return res.status(400).json({ message: 'Both parties must acknowledge first' });

    food.adminCompleted = true;
    food.status = 'completed';
    await food.save();

    // Notify restaurant
    await createNotification({
      recipient: food.postedBy,
      message: `🎉 Transaction for "${food.title}" has been marked as completed by admin!`,
      type: 'transaction_completed',
      listingId: food._id
    });

    // Notify volunteer
    await createNotification({
      recipient: food.claimedBy,
      message: `🎉 Transaction for "${food.title}" has been marked as completed by admin!`,
      type: 'transaction_completed',
      listingId: food._id
    });

    res.json({ message: 'Transaction completed!', food });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Get payment intent for existing claim
exports.getPaymentIntent = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id)
      .populate('postedBy', 'name email phone address');

    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.status !== 'pending_payment')
      return res.status(400).json({ message: 'Payment not required' });

    // Always create a fresh payment intent
    const { createPaymentIntent } = require('../utils/stripeHelper');
    const paymentIntent = await createPaymentIntent(food.price);
    food.paymentIntentId = paymentIntent.id;
    await food.save();

    res.json({ food, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ message: err.message });
  }
};