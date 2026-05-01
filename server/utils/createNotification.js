const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({ recipient, message, type, listingId }) => {
  try {
    await Notification.create({ recipient, message, type, listingId });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

// Notify all NGOs and volunteers
const notifyAllVolunteersAndNGOs = async ({ message, type, listingId }) => {
  try {
    const users = await User.find({
      role: { $in: ['volunteer', 'ngo', 'user'] },
      isVerified: true
    });
    const notifications = users.map(user => ({
      recipient: user._id,
      message,
      type,
      listingId,
      isRead: false,
    }));
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error('Bulk notification error:', err.message);
  }
};

// Notify all admins
const notifyAllAdmins = async ({ message, type, listingId }) => {
  try {
    const admins = await User.find({ role: 'admin', isVerified: true });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      message,
      type,
      listingId,
      isRead: false,
    }));
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error('Admin notification error:', err.message);
  }
};

module.exports = { createNotification, notifyAllVolunteersAndNGOs, notifyAllAdmins };