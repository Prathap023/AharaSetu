import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: '',
    expiryTime: '',
    type: 'free',
    price: 0,
    address: '',
    phone: '',
    contactEmail: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://aharasetu-backend.onrender.com/api/food', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Food listing submitted! Waiting for admin approval.');
      setForm({
        title: '',
        description: '',
        quantity: '',
        expiryTime: '',
        type: 'free',
        price: 0,
        address: '',
        phone: '',
        contactEmail: '',
      });
    } 
    catch (err) {
  console.error("FULL ERROR:", err);
  console.error("STATUS:", err.response?.status);
  console.error("DATA:", err.response?.data);

  setMessage(err.response?.data?.message || err.message);
}
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Dashboard</h2>
        <p style={styles.subtitle}>
          Welcome, {user.name}! You are logged in as <strong>{user.role}</strong>
        </p>
      </div>

      {user.role === 'restaurant' && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>🍛 Post Surplus Food</h3>
          <p style={styles.formSubtitle}>
            Fill in the details — admin will review before it goes live
          </p>

          {message && (
            <p style={{
              ...styles.message,
              backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
              color: message.includes('✅') ? '#2e7d32' : '#c62828',
            }}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Food Title</label>
              <input style={styles.input} type="text" name="title"
                placeholder="e.g. Biryani, Chapati, Rice"
                value={form.title} onChange={handleChange} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea style={{ ...styles.input, height: '80px' }}
                name="description" placeholder="Describe the food..."
                value={form.description} onChange={handleChange} />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Quantity</label>
                <input style={styles.input} type="text" name="quantity"
                  placeholder="e.g. 10 plates"
                  value={form.quantity} onChange={handleChange} required />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Expiry Time</label>
                <input style={styles.input} type="datetime-local"
                  name="expiryTime" value={form.expiryTime}
                  onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Listing Type</label>
                <select style={styles.input} name="type"
                  value={form.type} onChange={handleChange}>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {form.type === 'paid' && (
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Price (₹)</label>
                  <input style={styles.input} type="number" name="price"
                    placeholder="Enter price"
                    value={form.price} onChange={handleChange} />
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>📍 Restaurant Address</label>
              <input style={styles.input} type="text" name="address"
                placeholder="Full address of your restaurant"
                value={form.address} onChange={handleChange} required />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>📞 Phone Number</label>
                <input style={styles.input} type="text" name="phone"
                  placeholder="Your contact number"
                  value={form.phone} onChange={handleChange} required />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>📧 Contact Email</label>
                <input style={styles.input} type="email" name="contactEmail"
                  placeholder="Your contact email"
                  value={form.contactEmail} onChange={handleChange} required />
              </div>
            </div>

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Submitting...' : '🍱 Submit Food Listing'}
            </button>
          </form>
        </div>
      )}

      {(user.role === 'volunteer' || user.role === 'ngo' || user.role === 'user') && (
        <div style={styles.infoCard}>
          <h3>👋 Hello {user.name}!</h3>
          <p>As a <strong>{user.role}</strong>, you can:</p>
          <ul style={styles.list}>
            <li>✅ Browse available food listings</li>
            <li>✅ Claim free or low cost food</li>
            <li>✅ Track your claims in My Claims</li>
            <li>✅ Distribute food to people in need</li>
          </ul>
          <button style={styles.btn} onClick={() => navigate('/')}>
            🍱 Browse Food Listings
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', backgroundColor: '#f1f8e9', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#2e7d32', fontSize: '28px' },
  subtitle: { color: '#666', fontSize: '15px' },
  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', maxWidth: '650px', margin: '0 auto' },
  formTitle: { color: '#2e7d32', marginBottom: '5px' },
  formSubtitle: { color: '#888', fontSize: '14px', marginBottom: '20px' },
  field: { marginBottom: '18px' },
  row: { display: 'flex', gap: '15px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  message: { padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  infoCard: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' },
  list: { lineHeight: '2', color: '#444', marginBottom: '20px' },
};

export default Dashboard;