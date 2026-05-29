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
    const {
      title, description, quantityNumber, quantityUnit,
      expiryTime, type, pricePerUnit, address, phone, contactEmail
    } = req.body;

    const food = await FoodListing.create({
      title,
      description,
      quantity: `${quantityNumber} ${quantityUnit}`, // for display
      quantityNumber: parseInt(quantityNumber),
      quantityUnit: quantityUnit || 'plates',
      remainingQuantity: parseInt(quantityNumber),
      expiryTime,
      type,
      pricePerUnit: type === 'paid' ? parseFloat(pricePerUnit) : 0,
      price: type === 'paid' ? parseFloat(pricePerUnit) : 0, // price per unit
      address,
      phone,
      contactEmail,
      postedBy: req.user.id,
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        message: `New listing "${food.title}" posted by ${req.user.name}`,
        type: 'new_listing',
        listingId: food._id,
      });
    }

    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all admin approved listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({
      adminApproved: true,
      adminRejected: false,
      status: 'available',
    })
      .populate('postedBy', 'name email phone')
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all listings for admin
exports.getAdminListings = async (req, res) => {
  try {
    const food = await FoodListing.find({
      parentListing: null // only show original listings not auto-created remainders
    })
      .populate('postedBy', 'name email phone')
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 });
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
    const food = await FoodListing.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Listing not found' });

    food.adminRejected = true;
    food.adminApproved = false;
    food.rejectionReason = req.body.reason || 'Rejected by admin';
    await food.save();

    await createNotification({
      recipient: food.postedBy,
      message: `Your listing "${food.title}" was rejected. Reason: ${food.rejectionReason}`,
      type: 'listing_rejected',
      listingId: food._id
    });

    res.json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Claim listing (volunteer/NGO)
exports.claimFood = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!food) return res.status(404).json({ message: 'Listing not found' });
    if (food.status !== 'available') return res.status(400).json({ message: 'Listing not available' });

    const requestedQty = parseInt(req.body.quantity) || 1;

    // Check remaining quantity
    if (requestedQty > food.remainingQuantity) {
      return res.status(400).json({
        message: `Only ${food.remainingQuantity} ${food.quantityUnit} available`
      });
    }

    // Regular user restrictions
    if (req.user.role === 'user') {
      if (food.quantityUnit === 'kg') {
        return res.status(400).json({ message: 'Regular users can only claim plate-based food' });
      }
      if (requestedQty > 2) {
        return res.status(400).json({ message: 'Regular users can claim maximum 2 plates per order' });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayClaims = await FoodListing.countDocuments({
        claimedBy: req.user.id,
        updatedAt: { $gte: today },
      });
      if (todayClaims >= 3) {
        return res.status(400).json({ message: 'You have reached your daily limit of 3 claims' });
      }
    }

    // Calculate total price for this claim
    const pricePerUnit = food.pricePerUnit || 0;
    const totalPrice = food.type === 'paid' ? pricePerUnit * requestedQty : 0;

    // ✅ Just update the existing listing — NO duplicate creation
    food.remainingQuantity -= requestedQty;
    food.claimedQuantity = requestedQty;
    food.claimedBy = req.user.id;
    food.price = totalPrice;

    // Set status based on type
    if (food.type === 'paid') {
      food.status = 'pending_payment';
    } else {
      food.status = 'pending_restaurant_approval';
    }

    await food.save();

    // ✅ If remaining > 0 — create a SEPARATE listing document
    // only for remaining so others can claim it independently
    if (food.remainingQuantity > 0) {
      const newListing = new FoodListing({
        title: food.title,
        description: food.description,
        quantity: `${food.remainingQuantity} ${food.quantityUnit}`,
        quantityNumber: food.remainingQuantity,
        quantityUnit: food.quantityUnit,
        remainingQuantity: food.remainingQuantity,
        expiryTime: food.expiryTime,
        type: food.type,
        pricePerUnit: food.pricePerUnit,
        price: food.pricePerUnit,
        address: food.address,
        phone: food.phone,
        contactEmail: food.contactEmail,
        postedBy: food.postedBy._id,
        adminApproved: true,
        adminRejected: false,
        status: 'available',
        parentListing: food._id, // reference to original
      });
      await newListing.save();
    }

    await createNotification({
      recipient: food.postedBy._id,
      message: `${req.user.name} claimed ${requestedQty} ${food.quantityUnit} of "${food.title}"`,
      type: 'new_claim',
      listingId: food._id,
    });

    res.json({ message: 'Food claimed!', food, totalPrice });
  } catch (err) {
    console.error('claimFood error:', err);
    res.status(500).json({ message: err.message });
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
    const listings = await FoodListing.find({
      postedBy: req.user.id,
      parentListing: null // ✅ only show original listings
    })
      .populate('claimedBy', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get volunteer's claimed listings
exports.getMyClaimedListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({ claimedBy: req.user.id })
      .populate('postedBy', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(listings);
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
    const food = await FoodListing.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Listing not found' });

    // Calculate total from pricePerUnit × claimedQuantity
    const qty = food.claimedQuantity || 1;
    const pricePerUnit = food.pricePerUnit || food.price || 0;
    const totalAmount = pricePerUnit * qty;

    console.log('Payment intent:', { qty, pricePerUnit, totalAmount });

    // Create fresh payment intent every time
    const paymentIntent = await createPaymentIntent(
  Math.round(totalAmount * 100),
  {
    foodId: food._id.toString(),
    userId: req.user.id,
    quantity: qty,
    pricePerUnit,
    totalAmount,
  }
);

    // Update food with latest payment intent
    food.paymentIntentId = paymentIntent.id;
    food.price = totalAmount; // update total price
    await food.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      food: {
        _id: food._id,
        title: food.title,
        claimedQuantity: qty,
        quantityUnit: food.quantityUnit || 'plates',
        pricePerUnit,
        price: totalAmount,
        status: food.status,
      }
    });
  } catch (err) {
    console.error('getPaymentIntent error:', err);
    res.status(500).json({ message: err.message });
  }
};