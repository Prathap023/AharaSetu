import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// ⚠️ Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51TQBumG33N3X6w65ofiu7iqGnzwO6tLbjmFXZeWFrV93LnG1z3RmgtEFzC9wKJodrP56ZSRyYOJyd5s4zOI5ehs000Gcfa8jLk');

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
};

function CheckoutForm({ food, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage('❌ Stripe not loaded yet. Please wait.');
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setMessage('❌ Card details not found.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Step 1 — Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name },
      });

      if (pmError) {
        setMessage(`❌ ${pmError.message}`);
        setLoading(false);
        return;
      }

      console.log('Payment method created:', paymentMethod.id);
      console.log('Client secret:', clientSecret);

      // Step 2 — Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (error) {
        console.error('Stripe confirm error:', error);
        setMessage(`❌ ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('Payment intent status:', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        // Step 3 — Tell backend
        await axios.put(
          `https://aharasetu-backend-pov2.onrender.com/api/food/pay/${food._id}`,
          { paymentIntentId: paymentIntent.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('✅ Payment successful! Receipts sent to your email. Redirecting...');
        setTimeout(() => navigate('/my-claims'), 3000);
      } else {
        setMessage(`❌ Payment status: ${paymentIntent.status}. Please try again.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setMessage('❌ ' + (err.response?.data?.message || err.message || 'Something went wrong!'));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handlePayment}>
      <div style={styles.field}>
        <label style={styles.label}>Cardholder Name</label>
        <input
          style={styles.input}
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Card Number</label>
        <div style={styles.stripeInput}>
          <CardNumberElement options={cardElementOptions} />
        </div>
      </div>

      <div style={styles.row}>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>Expiry Date</label>
          <div style={styles.stripeInput}>
            <CardExpiryElement options={cardElementOptions} />
          </div>
        </div>
        <div style={{ ...styles.field, flex: 1 }}>
          <label style={styles.label}>CVV</label>
          <div style={styles.stripeInput}>
            <CardCvcElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      <div style={styles.testInfo}>
        <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>🧪 Test Card:</p>
        <p style={{ margin: '2px 0' }}>Card: <strong>4242 4242 4242 4242</strong></p>
        <p style={{ margin: '2px 0' }}>Expiry: <strong>12/27</strong> CVV: <strong>123</strong></p>
      </div>

      {message && (
        <p style={{
          ...styles.message,
          backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
          color: message.includes('✅') ? '#2e7d32' : '#c62828',
        }}>
          {message}
        </p>
      )}

      <button
        style={{
          ...styles.btn,
          opacity: loading || !stripe ? 0.7 : 1,
          cursor: loading || !stripe ? 'not-allowed' : 'pointer'
        }}
        type="submit"
        disabled={loading || !stripe}
      >
        {loading ? '⏳ Processing...' : `💳 Pay ₹${food?.price}`}
      </button>
    </form>
  );
}

function Payment() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentIntent();
  }, []);

  const fetchPaymentIntent = async () => {
    try {
      console.log('Fetching payment intent for:', id);
      const res = await axios.get(
        `https://aharasetu-backend-pov2.onrender.com/api/food/get-payment-intent/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Got client secret:', res.data.clientSecret?.substring(0, 20) + '...');
      setFood(res.data.food);
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to load payment');
    }
    setLoading(false);
  };

  if (loading) return (
    <div style={styles.center}><p>⏳ Loading payment details...</p></div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: '#c62828' }}>❌ {error}</p>
      <button style={styles.backBtn} onClick={() => navigate('/')}>Go Back</button>
    </div>
  );

  if (!food || !clientSecret) return (
    <div style={styles.center}>
      <p>❌ Payment session not found.</p>
      <button style={styles.backBtn} onClick={() => navigate('/')}>Go Back</button>
    </div>
  );

  const options = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>💳 Secure Payment</h2>
          <p style={styles.subtitle}>Powered by Stripe</p>
        </div>

       <div style={styles.orderSummary}>
        <p style={styles.summaryTitle}>Order Summary</p>
        <div style={styles.summaryRow}>
          <span>Item</span>
          <span>{food?.title}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Quantity</span>
          <span>{food?.claimedQuantity} {food?.quantityUnit}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Price per {food?.quantityUnit === 'kg' ? 'kg' : 'plate'}</span>
          <span>₹{food?.pricePerUnit}</span>
        </div>
        <div style={{ ...styles.summaryRow, borderTop: '1px solid #E5E7EB', paddingTop: '10px', marginTop: '6px', fontWeight: '700', fontSize: '1rem', color: '#1C1C1C' }}>
          <span>Total</span>
          <span>₹{food?.price}</span>
        </div>
      </div>

        <div style={styles.stripeBox}>
          <span style={styles.stripeLogo}>stripe</span>
          <span style={styles.secureText}>🔒 Secured by Stripe</span>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm food={food} clientSecret={clientSecret} />
        </Elements>

        <button style={styles.cancelBtn} onClick={() => navigate('/')}>
          Cancel Payment
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', paddingTop: '84px' },
  card: { background: 'white', padding: '36px', borderRadius: '20px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', width: '100%', maxWidth: '460px', border: '1px solid #F0F0F0' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '4px' },
  subtitle: { fontSize: '0.85rem', color: '#9CA3AF' },
  orderSummary: { background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' },
  summaryTitle: { fontSize: '0.78rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.88rem', color: '#374151' },
  stripeBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#635bff', padding: '10px 14px', borderRadius: '9px', marginBottom: '20px' },
  stripeLogo: { color: 'white', fontWeight: '800', fontSize: '1.1rem', fontStyle: 'italic' },
  secureText: { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' },
  field: { marginBottom: '16px' },
  row: { display: 'flex', gap: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '11px 14px', borderRadius: '9px', border: '1.5px solid #E5E7EB', fontSize: '0.93rem', color: '#1C1C1C', boxSizing: 'border-box', background: '#FAFAFA', outline: 'none' },
  stripeInput: { padding: '12px 14px', borderRadius: '9px', border: '1.5px solid #E5E7EB', background: 'white' },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #635bff, #7c73ff)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', marginTop: '8px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,91,255,0.3)' },
  cancelBtn: { width: '100%', padding: '12px', background: 'transparent', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px' },
  message: { padding: '10px 13px', borderRadius: '8px', marginTop: '12px', fontSize: '0.85rem', textAlign: 'center', fontWeight: '500' },
  testInfo: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 13px', fontSize: '0.78rem', color: '#92400E', marginBottom: '12px' },
  center: { textAlign: 'center', padding: '60px', paddingTop: '120px' },
  backBtn: { padding: '10px 20px', background: '#FF5200', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', marginTop: '14px', fontWeight: '600' },
};

export default Payment;