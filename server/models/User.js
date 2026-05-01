const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['restaurant', 'volunteer', 'ngo', 'user', 'admin'],
    default: 'user'
  },
  phone: { type: String },
  address: { type: String },
  walletBalance: { type: Number, default: 0 },

  // Email verification
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpire: { type: Date },

  // Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);