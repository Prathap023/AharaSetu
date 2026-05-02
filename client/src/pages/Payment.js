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
          `https://aharasetu-backend-q6tj.onrender.com/api/food/pay/${food._id}`,
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
        `https://aharasetu-backend-q6tj.onrender.com/api/food/get-payment-intent/${id}`,
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
          <h3 style={styles.summaryTitle}>🧾 Order Summary</h3>
          <div style={styles.summaryRow}>
            <span>Food Item</span>
            <span><strong>{food.title}</strong></span>
          </div>
          <div style={styles.summaryRow}>
            <span>Quantity</span>
            <span>{food.quantity}</span>
          </div>
          <div style={{
            ...styles.summaryRow,
            borderTop: '2px solid #2e7d32',
            paddingTop: '10px',
            marginTop: '5px'
          }}>
            <span><strong>Total Amount</strong></span>
            <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '18px' }}>
              ₹{food.price}
            </span>
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
  container: { minHeight: '100vh', backgroundColor: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { color: '#2e7d32', marginBottom: '5px' },
  subtitle: { color: '#888', fontSize: '14px' },
  orderSummary: { backgroundColor: '#f9fbe7', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  summaryTitle: { color: '#2e7d32', marginTop: 0, marginBottom: '10px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px', color: '#444' },
  stripeBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#635bff', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px' },
  stripeLogo: { color: 'white', fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' },
  secureText: { color: 'white', fontSize: '13px' },
  field: { marginBottom: '18px' },
  row: { display: 'flex', gap: '15px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  stripeInput: { padding: '12px 14px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' },
  btn: { width: '100%', padding: '14px', backgroundColor: '#635bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
  cancelBtn: { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#888', border: '1px solid #ccc', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', marginTop: '10px' },
  message: { padding: '10px', borderRadius: '8px', marginTop: '15px', fontSize: '14px', textAlign: 'center' },
  testInfo: { backgroundColor: '#fff8e1', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#f57f17', marginBottom: '15px' },
  center: { textAlign: 'center', padding: '60px' },
  backBtn: { padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' },
};

export default Payment;