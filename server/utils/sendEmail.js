const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendPaymentReceiptToVolunteer = async ({
  volunteerEmail, volunteerName, foodTitle, amount, paymentId, restaurantName, restaurantAddress, restaurantPhone,
}) => {
  await transporter.sendMail({
    from: `"AharaSetu" <${process.env.EMAIL_FROM}>`,
    to: volunteerEmail,
    subject: `✅ Payment Receipt - ₹${amount} for ${foodTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="background-color: #2e7d32; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🍱 AharaSetu</h1>
          <p style="color: #c8e6c9; margin: 5px 0 0;">Payment Receipt</p>
        </div>
        <div style="padding: 30px;">
          <p>Dear <strong>${volunteerName}</strong>,</p>
          <p>Your payment was successful!</p>
          <div style="background-color: #f9fbe7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">🧾 Payment Details</h3>
            <table style="width: 100%;">
              <tr><td style="color: #666; padding: 8px 0;">Food Item</td><td><strong>${foodTitle}</strong></td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Amount Paid</td><td style="color: #2e7d32;"><strong>₹${amount}</strong></td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Payment ID</td><td style="font-family: monospace;">${paymentId}</td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Date</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px;">
            <h3 style="color: #2e7d32; margin-top: 0;">🏪 Restaurant Details</h3>
            <p>👤 <strong>${restaurantName}</strong></p>
            <p>📍 ${restaurantAddress}</p>
            <p>📞 ${restaurantPhone}</p>
          </div>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© 2025 AharaSetu</p>
        </div>
      </div>
    `
  });
};

const sendPaymentNotificationToRestaurant = async ({
  restaurantEmail, restaurantName, foodTitle, amount, paymentId, volunteerName, volunteerEmail,
}) => {
  await transporter.sendMail({
    from: `"AharaSetu" <${process.env.EMAIL_FROM}>`,
    to: restaurantEmail,
    subject: `💰 Payment Received - ₹${amount} for ${foodTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="background-color: #1565c0; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🍱 AharaSetu</h1>
          <p style="color: #bbdefb; margin: 5px 0 0;">Payment Notification</p>
        </div>
        <div style="padding: 30px;">
          <p>Dear <strong>${restaurantName}</strong>,</p>
          <p>Someone has paid for your food listing!</p>
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin-top: 0;">💰 Payment Details</h3>
            <table style="width: 100%;">
              <tr><td style="color: #666; padding: 8px 0;">Food Item</td><td><strong>${foodTitle}</strong></td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Amount</td><td style="color: #1565c0;"><strong>₹${amount}</strong></td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Payment ID</td><td style="font-family: monospace;">${paymentId}</td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Date</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px;">
            <h3 style="color: #6a1b9a; margin-top: 0;">👤 Volunteer Details</h3>
            <p>Name: <strong>${volunteerName}</strong></p>
            <p>📧 ${volunteerEmail}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">Please login to AharaSetu and approve or reject this claim.</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© 2025 AharaSetu</p>
        </div>
      </div>
    `
  });
};

const sendRefundNotification = async ({
  volunteerEmail, volunteerName, foodTitle, amount, paymentId,
}) => {
  await transporter.sendMail({
    from: `"AharaSetu" <${process.env.EMAIL_FROM}>`,
    to: volunteerEmail,
    subject: `💸 Refund Processed - ₹${amount} for ${foodTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="background-color: #c62828; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🍱 AharaSetu</h1>
          <p style="color: #ffcdd2; margin: 5px 0 0;">Refund Notification</p>
        </div>
        <div style="padding: 30px;">
          <p>Dear <strong>${volunteerName}</strong>,</p>
          <p>The restaurant has rejected your claim. Your payment has been refunded.</p>
          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #c62828; margin-top: 0;">💸 Refund Details</h3>
            <table style="width: 100%;">
              <tr><td style="color: #666; padding: 8px 0;">Food Item</td><td><strong>${foodTitle}</strong></td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Refund Amount</td><td style="color: #c62828;"><strong>₹${amount}</strong></td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Payment ID</td><td style="font-family: monospace;">${paymentId}</td></tr>
              <tr><td style="color: #666; padding: 8px 0;">Date</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
          <p style="color: #666; font-size: 14px;">Refund will reflect in 5-7 business days.</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© 2025 AharaSetu</p>
        </div>
      </div>
    `
  });
};

const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  await transporter.sendMail({
    from: `"AharaSetu" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🔐 Password Reset Request - AharaSetu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="background-color: #2e7d32; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🍱 AharaSetu</h1>
          <p style="color: #c8e6c9; margin: 5px 0 0;">Password Reset Request</p>
        </div>
        <div style="padding: 30px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
              🔐 Reset My Password
            </a>
          </div>
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #e65100; font-size: 13px;">⚠️ This link expires in <strong>15 minutes</strong>. If you did not request this, ignore this email.</p>
          </div>
          <p style="color: #666; font-size: 13px; margin-top: 15px;">Or copy this link:</p>
          <p style="color: #1565c0; font-size: 13px; word-break: break-all;">${resetUrl}</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">© 2025 AharaSetu</p>
        </div>
      </div>
    `
  });
};
const sendOTPEmail = async ({ email, name, otp }) => {
  await transporter.sendMail({
    from: `"AharaSetu" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🔐 Your OTP for AharaSetu Registration`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="background-color: #2e7d32; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🍱 AharaSetu</h1>
          <p style="color: #c8e6c9; margin: 5px 0 0;">Email Verification</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>
          <p>Thank you for registering with AharaSetu! Use the OTP below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #2e7d32; color: white; font-size: 36px; font-weight: bold; padding: 20px 40px; border-radius: 12px; letter-spacing: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #e65100; font-size: 13px;">⚠️ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #888; font-size: 12px; margin: 0;">© 2025 AharaSetu — Connecting surplus food with people in need</p>
        </div>
      </div>
    `
  });
};

module.exports = {
  sendPaymentReceiptToVolunteer,
  sendPaymentNotificationToRestaurant,
  sendRefundNotification,
  sendPasswordResetEmail,
  sendOTPEmail
};