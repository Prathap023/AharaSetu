const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  sendPasswordResetEmail,
  sendOTPEmail
} = require('../utils/sendEmail');

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Register — send OTP first
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if email already exists and verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    console.log('OTP for', email, ':', otp);
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = hashed;
      existingUser.role = role;
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpire;
      await existingUser.save();
    } else {
      // Create new user
      await User.create({
        name, email, password: hashed, role,
        otp, otpExpire, isVerified: false
      });
    }

    // Send OTP email
// Auto verify admin accounts
if (role === 'admin') {
  const adminUser = await User.findOne({ email });
  if (adminUser) {
    adminUser.isVerified = true;
    adminUser.otp = undefined;
    adminUser.otpExpire = undefined;
    await adminUser.save();
  }
  return res.status(201).json({ message: 'Admin account created and verified!' });
}

// Send OTP email for non-admin users
// Auto verify admin accounts
if (role === 'admin') {
  const adminUser = await User.findOne({ email });
  if (adminUser) {
    adminUser.isVerified = true;
    adminUser.otp = undefined;
    adminUser.otpExpire = undefined;
    await adminUser.save();
  }
  return res.status(201).json({ message: 'Admin account created and verified!' });
}

// Send OTP email for non-admin users
// Auto verify admin accounts
if (role === 'admin') {
  const adminUser = await User.findOne({ email });
  if (adminUser) {
    adminUser.isVerified = true;
    adminUser.otp = undefined;
    adminUser.otpExpire = undefined;
    await adminUser.save();
  }
  return res.status(201).json({ message: 'Admin account created and verified!' });
}

// Auto verify admin accounts

if (role === 'admin') {

  const adminUser = await User.findOne({ email });

  if (adminUser) {

    adminUser.isVerified = true;

    adminUser.otp = undefined;

    adminUser.otpExpire = undefined;

    await adminUser.save();

  }

  return res.status(201).json({ message: 'Admin account created and verified!' });

}

// Send OTP email for non-admin users

await sendOTPEmail({ email, name, otp });

res.status(201).json({

  message: 'OTP sent to your email! Please verify to complete registration.',

  email

});
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'OTP expired! Please register again.' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP! Please try again.' });

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email, isVerified: false });
    if (!user) return res.status(404).json({ message: 'User not found or already verified!' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOTPEmail({ email, name: user.name, otp });

    res.json({ message: 'New OTP sent to your email!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Email not verified! Please verify your OTP first.',
        notVerified: true,
        email
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    console.log('Forgot password request for:', email);
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    console.log('Reset token saved to DB');

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log('Reset URL:', resetUrl);

    try {
      await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl });
      console.log('✅ Reset email sent successfully!');
      res.json({ message: 'Password reset email sent! Check your inbox.' });
    } catch (emailErr) {
      console.error('❌ Email sending failed:', emailErr.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ message: 'Email could not be sent. Error: ' + emailErr.message });
    }
  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};