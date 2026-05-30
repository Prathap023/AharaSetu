const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const RoleChangeRequest = require('../models/RoleChangeRequest');
const createNotification = require('../utils/createNotification');

// GET profile stats
exports.getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get claims stats
    const allClaims = await FoodListing.find({ claimedBy: userId });
    const completedClaims = allClaims.filter(c => c.status === 'completed');
    const freeClaims = completedClaims.filter(c => c.type === 'free');
    const paidClaims = completedClaims.filter(c => c.type === 'paid');

    // For restaurants — get listing stats
    const myListings = await FoodListing.find({ postedBy: userId });
    const completedListings = myListings.filter(l => l.status === 'completed');

    res.json({
      user,
      stats: {
        totalClaims: allClaims.length,
        completedClaims: completedClaims.length,
        freeClaims: freeClaims.length,
        paidClaims: paidClaims.length,
        totalListings: myListings.length,
        completedListings: completedListings.length,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST request role change
exports.requestRoleChange = async (req, res) => {
  try {
    const { requestedRole, reason } = req.body;
    const user = await User.findById(req.user.id);

    if (user.role === requestedRole) {
      return res.status(400).json({ message: 'You already have this role' });
    }

    // Check if pending request exists
    const existing = await RoleChangeRequest.findOne({
      user: req.user.id,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending role change request' });
    }

    const request = await RoleChangeRequest.create({
      user: req.user.id,
      currentRole: user.role,
      requestedRole,
      reason,
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        message: `${user.name} requested role change from ${user.role} to ${requestedRole}`,
        type: 'new_listing',
        listingId: null,
      });
    }

    res.status(201).json({ message: 'Role change request submitted!', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET my role change request status
exports.getMyRoleRequest = async (req, res) => {
  try {
    const request = await RoleChangeRequest.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all role requests (admin)
exports.getAllRoleRequests = async (req, res) => {
  try {
    const requests = await RoleChangeRequest.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT approve/reject role request (admin)
exports.handleRoleRequest = async (req, res) => {
  try {
    const { action, adminNote } = req.body;
    const request = await RoleChangeRequest.findById(req.params.id)
      .populate('user', 'name email role');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'approve') {
      // Update user role
      await User.findByIdAndUpdate(request.user._id, { role: request.requestedRole });
      request.status = 'approved';
      request.adminNote = adminNote || '';

      await createNotification({
        recipient: request.user._id,
        message: `Your role change request to "${request.requestedRole}" has been approved!`,
        type: 'listing_approved',
        listingId: null,
      });
    } else {
      request.status = 'rejected';
      request.adminNote = adminNote || '';

      await createNotification({
        recipient: request.user._id,
        message: `Your role change request to "${request.requestedRole}" was rejected. ${adminNote || ''}`,
        type: 'listing_rejected',
        listingId: null,
      });
    }

    await request.save();
    res.json({ message: `Request ${action}d successfully`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};