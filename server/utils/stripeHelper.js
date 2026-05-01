const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'inr',
    payment_method_types: ['card'],
  });
  return paymentIntent;
};

const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (err) {
    throw new Error('Payment session expired. Please claim the food again.');
  }
};

const createRefund = async (paymentIntentId) => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
  return refund;
};

module.exports = { createPaymentIntent, confirmPaymentIntent, createRefund };