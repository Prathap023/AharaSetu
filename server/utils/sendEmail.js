const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const createEmailTemplate = ({
  subtitle,
  content,
}) => `
<div style="
  font-family: Inter, Arial, sans-serif;
  max-width: 640px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid rgba(255,82,0,0.12);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
">

  <div style="
    background: linear-gradient(135deg,#FF5200,#FF8C00);
    padding: 32px 24px;
    text-align: center;
  ">

    <h1 style="
  color: white;
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
">
  Ahara
  <span style="color: black;">Setu</span>
</h1>

    <p style="
      color: rgba(255,255,255,0.82);
      margin: 10px 0 0;
      font-size: 14px;
      letter-spacing: 0.03em;
    ">
      ${subtitle}
    </p>
  </div>

  <div style="
    padding: 36px 30px;
    color: #1C1C1C;
  ">
    ${content}
  </div>

  <div style="
    background: #1C1C1C;
    padding: 18px;
    text-align: center;
  ">
    <p style="
      color: rgba(255,255,255,0.45);
      font-size: 12px;
      margin: 0;
      line-height: 1.6;
    ">
      © 2025 AharaSetu — Connecting surplus food with people in need
    </p>
  </div>
</div>
`;

const infoBox = (content) => `
<div style="
  background: #FFF7F2;
  border: 1px solid rgba(255,82,0,0.08);
  padding: 22px;
  border-radius: 16px;
  margin: 22px 0;
">
  ${content}
</div>
`;

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

  const html = createEmailTemplate({
    subtitle: 'Payment Receipt',

    content: `
      <p style="font-size:16px;">
        Dear <strong>${volunteerName}</strong>,
      </p>

      <p style="
        color:#6B6B6B;
        line-height:1.8;
      ">
        Your payment was successful.
        Thank you for helping reduce food wastage ❤️
      </p>

      ${infoBox(`
        <h3 style="
          color:#FF5200;
          margin-top:0;
          font-size:18px;
        ">
          🧾 Payment Details
        </h3>

        <table style="width:100%;">
          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Food Item
            </td>

            <td>
              <strong>${foodTitle}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Amount Paid
            </td>

            <td style="color:#FF5200;">
              <strong>₹${amount}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Payment ID
            </td>

            <td style="
              font-family:monospace;
            ">
              ${paymentId}
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Date
            </td>

            <td>
              ${new Date().toLocaleString()}
            </td>
          </tr>
        </table>
      `)}

      ${infoBox(`
        <h3 style="
          color:#FF5200;
          margin-top:0;
          font-size:18px;
        ">
          🏪 Restaurant Details
        </h3>

        <p>
          <strong>${restaurantName}</strong>
        </p>

        <p style="color:#6B6B6B;">
          📍 ${restaurantAddress}
        </p>

        <p style="color:#6B6B6B;">
          📞 ${restaurantPhone}
        </p>
      `)}
    `,
  });

  await resend.emails.send({
    from: 'AharaSetu <payment@aharasetu.in>',
    to: volunteerEmail,
    subject: `✅ Payment Receipt - ₹${amount} for ${foodTitle}`,
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

  const html = createEmailTemplate({
    subtitle: 'Payment Notification',

    content: `
      <p style="font-size:16px;">
        Dear <strong>${restaurantName}</strong>,
      </p>

      <p style="
        color:#6B6B6B;
        line-height:1.8;
      ">
        Someone has successfully paid for your food listing.
      </p>

      ${infoBox(`
        <h3 style="
          color:#FF5200;
          margin-top:0;
        ">
          💰 Payment Details
        </h3>

        <table style="width:100%;">
          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Food Item
            </td>

            <td>
              <strong>${foodTitle}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Amount
            </td>

            <td style="color:#FF5200;">
              <strong>₹${amount}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Payment ID
            </td>

            <td style="
              font-family:monospace;
            ">
              ${paymentId}
            </td>
          </tr>
        </table>
      `)}

      ${infoBox(`
        <h3 style="
          color:#FF5200;
          margin-top:0;
        ">
          👤 Volunteer Details
        </h3>

        <p>
          <strong>${volunteerName}</strong>
        </p>

        <p style="color:#6B6B6B;">
          📧 ${volunteerEmail}
        </p>
      `)}

      <p style="
        color:#6B6B6B;
        margin-top:24px;
      ">
        Please login to AharaSetu and approve or reject the claim.
      </p>
    `,
  });

  await resend.emails.send({
    from: 'AharaSetu <payment@aharasetu.in>',
    to: restaurantEmail,
    subject: `💰 Payment Received - ₹${amount} for ${foodTitle}`,
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

  const html = createEmailTemplate({
    subtitle: 'Refund Notification',

    content: `
      <p style="font-size:16px;">
        Dear <strong>${volunteerName}</strong>,
      </p>

      <p style="
        color:#6B6B6B;
        line-height:1.8;
      ">
        The restaurant rejected your claim.
        Your payment has been refunded successfully.
      </p>

      ${infoBox(`
        <h3 style="
          color:#FF5200;
          margin-top:0;
        ">
          💸 Refund Details
        </h3>

        <table style="width:100%;">
          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Food Item
            </td>

            <td>
              <strong>${foodTitle}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Refund Amount
            </td>

            <td style="color:#FF5200;">
              <strong>₹${amount}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0;color:#6B6B6B;">
              Payment ID
            </td>

            <td style="
              font-family:monospace;
            ">
              ${paymentId}
            </td>
          </tr>
        </table>
      `)}

      <p style="
        color:#6B6B6B;
        font-size:14px;
      ">
        Refund will reflect within 5–7 business days.
      </p>
    `,
  });

  await resend.emails.send({
    from: 'AharaSetu <refunds@aharasetu.in>',
    to: volunteerEmail,
    subject: `💸 Refund Processed - ₹${amount} for ${foodTitle}`,
    html,
  });
};

const sendPasswordResetEmail = async ({
  email,
  name,
  resetUrl,
}) => {

  const html = createEmailTemplate({
    subtitle: 'Password Reset Request',

    content: `
      <p style="font-size:16px;">
        Dear <strong>${name}</strong>,
      </p>

      <p style="
        color:#6B6B6B;
        line-height:1.8;
      ">
        We received a request to reset your password.
      </p>

      <div style="
        text-align:center;
        margin:32px 0;
      ">
        <a
          href="${resetUrl}"
          style="
            background:linear-gradient(135deg,#FF5200,#FF8C00);
            color:white;
            padding:14px 30px;
            border-radius:12px;
            text-decoration:none;
            font-size:15px;
            font-weight:700;
            display:inline-block;
            box-shadow:0 6px 20px rgba(255,82,0,0.3);
          "
        >
          🔐 Reset Password
        </a>
      </div>

      ${infoBox(`
        <p style="
          margin:0;
          color:#6B6B6B;
          font-size:13px;
          line-height:1.8;
        ">
          ⚠️ This link expires in
          <strong>15 minutes</strong>.
          If you did not request this,
          please ignore this email.
        </p>
      `)}

      <p style="
        color:#9CA3AF;
        font-size:13px;
        margin-top:18px;
      ">
        Or copy this link:
      </p>

      <p style="
        color:#FF5200;
        font-size:13px;
        word-break:break-all;
      ">
        ${resetUrl}
      </p>
    `,
  });

  await resend.emails.send({
    from: 'AharaSetu <reset-password@aharasetu.in>',
    to: email,
    subject: '🔐 Password Reset Request - AharaSetu',
    html,
  });
};

const sendOTPEmail = async ({
  email,
  name,
  otp,
}) => {

  const html = createEmailTemplate({
    subtitle: 'Email Verification',

    content: `
      <p style="font-size:16px;">
        Dear <strong>${name}</strong>,
      </p>

      <p style="
        color:#6B6B6B;
        line-height:1.8;
      ">
        Thank you for registering with AharaSetu.
        Use the OTP below to verify your email.
      </p>

      <div style="
        text-align:center;
        margin:36px 0;
      ">
        <div style="
          background:linear-gradient(135deg,#FF5200,#FF8C00);
          color:white;
          font-size:38px;
          font-weight:800;
          padding:22px 42px;
          border-radius:18px;
          letter-spacing:10px;
          display:inline-block;
          box-shadow:0 10px 30px rgba(255,82,0,0.25);
        ">
          ${otp}
        </div>
      </div>

      ${infoBox(`
        <p style="
          margin:0;
          color:#6B6B6B;
          font-size:13px;
          line-height:1.8;
        ">
          ⚠️ This OTP expires in
          <strong>10 minutes</strong>.
          Do not share it with anyone.
        </p>
      `)}
    `,
  });

  await resend.emails.send({
    from: 'AharaSetu <verification@aharasetu.in>',
    to: email,
    subject: '🔐 Your OTP for AharaSetu Registration',
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