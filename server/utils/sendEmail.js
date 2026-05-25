const axios = require("axios");

const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT;

const sendMail = async ({
  subject,
  recipient,
  html,
}) => {
  try {
    await axios.post(
      FORMSPREE_ENDPOINT,
      {
        email: recipient,
        subject,
        message: html,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Mail sent to ${recipient}`);
  } catch (error) {
    console.error("❌ Mail sending failed:", error.response?.data || error.message);
  }
};

const sendPaymentReceiptToVolunteer = async ({
  volunteerEmail,
  volunteerName,
  foodTitle,
  amount,
  paymentId,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
}) => {
  const html = `
    <h2>🍱 AharaSetu Payment Receipt</h2>

    <p>Dear <strong>${volunteerName}</strong>,</p>

    <p>Your payment was successful.</p>

    <h3>Payment Details</h3>
    <ul>
      <li>Food Item: ${foodTitle}</li>
      <li>Amount Paid: ₹${amount}</li>
      <li>Payment ID: ${paymentId}</li>
      <li>Date: ${new Date().toLocaleString()}</li>
    </ul>

    <h3>Restaurant Details</h3>
    <ul>
      <li>${restaurantName}</li>
      <li>${restaurantAddress}</li>
      <li>${restaurantPhone}</li>
    </ul>
  `;

  await sendMail({
    subject: `✅ Payment Receipt - ₹${amount}`,
    recipient: volunteerEmail,
    html,
  });
};

const sendPaymentNotificationToRestaurant = async ({
  restaurantEmail,
  restaurantName,
  foodTitle,
  amount,
  paymentId,
  volunteerName,
  volunteerEmail,
}) => {
  const html = `
    <h2>💰 Payment Received</h2>

    <p>Dear <strong>${restaurantName}</strong>,</p>

    <p>A volunteer has paid for your food listing.</p>

    <ul>
      <li>Food Item: ${foodTitle}</li>
      <li>Amount: ₹${amount}</li>
      <li>Payment ID: ${paymentId}</li>
      <li>Volunteer Name: ${volunteerName}</li>
      <li>Volunteer Email: ${volunteerEmail}</li>
    </ul>
  `;

  await sendMail({
    subject: `💰 Payment Received - ₹${amount}`,
    recipient: restaurantEmail,
    html,
  });
};

const sendRefundNotification = async ({
  volunteerEmail,
  volunteerName,
  foodTitle,
  amount,
 paymentId,
}) => {
  const html = `
    <h2>💸 Refund Processed</h2>

    <p>Dear <strong>${volunteerName}</strong>,</p>

    <p>Your refund has been initiated.</p>

    <ul>
      <li>Food Item: ${foodTitle}</li>
      <li>Refund Amount: ₹${amount}</li>
      <li>Payment ID: ${paymentId}</li>
    </ul>

    <p>Refund may take 5-7 business days.</p>
  `;

  await sendMail({
    subject: `💸 Refund Processed - ₹${amount}`,
    recipient: volunteerEmail,
    html,
  });
};

const sendPasswordResetEmail = async ({
  email,
  name,
  resetUrl,
}) => {
  const html = `
    <h2>🔐 Password Reset Request</h2>

    <p>Hello ${name},</p>

    <p>Click below to reset your password:</p>

    <a href="${resetUrl}">
      Reset Password
    </a>

    <p>This link expires in 15 minutes.</p>
  `;

  await sendMail({
    subject: `🔐 Password Reset`,
    recipient: email,
    html,
  });
};

const sendOTPEmail = async ({
  email,
  name,
  otp,
}) => {
  const html = `
    <h2>🔐 Email Verification</h2>

    <p>Hello ${name},</p>

    <p>Your OTP is:</p>

    <h1>${otp}</h1>

    <p>This OTP expires in 10 minutes.</p>
  `;

  await sendMail({
    subject: `🔐 Your OTP`,
    recipient: email,
    html,
  });
};

module.exports = {
  sendPaymentReceiptToVolunteer,
  sendPaymentNotificationToRestaurant,
  sendRefundNotification,
  sendPasswordResetEmail,
  sendOTPEmail,
};