import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', quantity: '',
    expiryTime: '', type: 'free', price: 0,
    address: '', phone: '', contactEmail: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://aharasetu-backend-pov2.onrender.com/api/food', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('success');
      setForm({ title: '', description: '', quantity: '', expiryTime: '', type: 'free', price: 0, address: '', phone: '', contactEmail: '' });
    } catch (err) {
      setMessage('error');
    }
    setLoading(false);
  };

  if (user.role !== 'restaurant') {
    return (
      <div style={styles.page}>
        <div style={styles.nonRestaurantWrap}>
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeAvatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h2 style={styles.welcomeName}>Hello, {user.name}!</h2>
            <span style={styles.welcomeRole}>{user.role}</span>
            <p style={styles.welcomeText}>
              As a <strong>{user.role}</strong>, you can browse available food listings, claim food, and make a difference in your community.
            </p>
            <div style={styles.quickLinks}>
              {[
                { icon: '🍱', label: 'Browse Food', path: '/' },
                { icon: '📦', label: 'My Claims', path: '/my-claims' },
                { icon: '📬', label: 'Contact', path: '/contact' },
              ].map(link => (
                <button
                  key={link.path}
                  style={styles.quickLink}
                  onClick={() => navigate(link.path)}
                >
                  <span style={styles.quickLinkIcon}>{link.icon}</span>
                  <span style={styles.quickLinkLabel}>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Post Surplus Food</h1>
            <p style={styles.pageSub}>Fill in the details and admin will review your listing</p>
          </div>
          <button style={styles.myListingsBtn} onClick={() => navigate('/my-listings')}>
            📋 My Listings →
          </button>
        </div>

        {/* Success/Error Message */}
        {message === 'success' && (
          <div style={styles.successBanner}>
            <span style={styles.successIcon}>✅</span>
            <div>
              <p style={styles.successTitle}>Listing submitted successfully!</p>
              <p style={styles.successSub}>Admin will review and approve it shortly. You'll be notified.</p>
            </div>
          </div>
        )}
        {message === 'error' && (
          <div style={styles.errorBanner}>
            ❌ Something went wrong. Please try again.
          </div>
        )}

        {/* Form Card */}
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>

            {/* Section: Food Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>🍛 Food Details</h3>
              <div style={styles.fieldGrid}>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Food Title *</label>
                  <input style={styles.input} type="text" name="title"
                    placeholder="e.g. Chicken Biryani, Veg Thali..."
                    value={form.title} onChange={handleChange} required />
                </div>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Description</label>
                  <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                    name="description" placeholder="Describe the food, portion size, freshness..."
                    value={form.description} onChange={handleChange} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Quantity *</label>
                  <input style={styles.input} type="text" name="quantity"
                    placeholder="e.g. 10 plates, 5 kg"
                    value={form.quantity} onChange={handleChange} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Expiry Date & Time *</label>
                  <input style={styles.input} type="datetime-local" name="expiryTime"
                    value={form.expiryTime} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Section: Pricing */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>💰 Pricing</h3>
              <div style={styles.typeToggle}>
                <button
                  type="button"
                  style={{
                    ...styles.typeBtn,
                    ...(form.type === 'free' ? styles.typeBtnActive : {})
                  }}
                  onClick={() => setForm({ ...form, type: 'free', price: 0 })}
                >
                  <span style={styles.typeBtnIcon}>🆓</span>
                  <span style={styles.typeBtnLabel}>Free</span>
                  <span style={styles.typeBtnDesc}>Donate at no cost</span>
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.typeBtn,
                    ...(form.type === 'paid' ? styles.typeBtnActive : {})
                  }}
                  onClick={() => setForm({ ...form, type: 'paid' })}
                >
                  <span style={styles.typeBtnIcon}>💰</span>
                  <span style={styles.typeBtnLabel}>Paid</span>
                  <span style={styles.typeBtnDesc}>Set a reduced price</span>
                </button>
              </div>
              {form.type === 'paid' && (
                <div style={{ ...styles.field, marginTop: '16px' }}>
                  <label style={styles.label}>Price (₹) *</label>
                  <div style={styles.priceWrap}>
                    <span style={styles.rupeeSymbol}>₹</span>
                    <input style={{ ...styles.input, paddingLeft: '32px' }}
                      type="number" name="price" placeholder="0"
                      value={form.price} onChange={handleChange} min="1" />
                  </div>
                </div>
              )}
            </div>

            {/* Section: Contact & Location */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>📍 Location & Contact</h3>
              <div style={styles.fieldGrid}>
                <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Restaurant Address *</label>
                  <input style={styles.input} type="text" name="address"
                    placeholder="Full address of your restaurant"
                    value={form.address} onChange={handleChange} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone Number *</label>
                  <input style={styles.input} type="text" name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Contact Email *</label>
                  <input style={styles.input} type="email" name="contactEmail"
                    placeholder="restaurant@example.com"
                    value={form.contactEmail} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={styles.submitRow}>
              <p style={styles.submitNote}>
                📋 Your listing will be reviewed by admin before going live
              </p>
              <button
                style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
                type="submit" disabled={loading}
              >
                {loading ? 'Submitting...' : '🍱 Submit Food Listing'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  wrap: { maxWidth: '780px', margin: '0 auto', padding: '40px 24px' },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px', gap: '16px',
  },
  pageTitle: {
    fontSize: '1.8rem', fontWeight: '800', color: '#1C1C1C',
    letterSpacing: '-0.02em', marginBottom: '4px',
  },
  pageSub: { fontSize: '0.9rem', color: '#9CA3AF' },
  myListingsBtn: {
    padding: '9px 18px', borderRadius: '9px',
    background: 'white', border: '1.5px solid #E5E7EB',
    fontSize: '0.85rem', fontWeight: '600', color: '#374151',
    cursor: 'pointer', flexShrink: 0,
  },
  successBanner: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
  },
  successIcon: { fontSize: '1.3rem', flexShrink: 0 },
  successTitle: { fontSize: '0.95rem', fontWeight: '600', color: '#16A34A', marginBottom: '2px' },
  successSub: { fontSize: '0.83rem', color: '#4ADE80' },
  errorBanner: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: '12px', padding: '14px 20px',
    fontSize: '0.9rem', color: '#DC2626', marginBottom: '24px',
  },
  formCard: {
    background: 'white', borderRadius: '16px',
    border: '1px solid #F0F0F0',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  formSection: {
    padding: '28px 32px',
    borderBottom: '1px solid #F3F4F6',
  },
  sectionTitle: {
    fontSize: '1rem', fontWeight: '700', color: '#1C1C1C',
    marginBottom: '20px', letterSpacing: '-0.01em',
  },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '0.83rem', fontWeight: '600', color: '#374151' },
  input: {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: '9px',
    fontSize: '0.92rem', color: '#1C1C1C', outline: 'none',
    background: '#FAFAFA', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  typeToggle: { display: 'flex', gap: '12px' },
  typeBtn: {
    flex: 1, padding: '16px', borderRadius: '12px',
    border: '2px solid #E5E7EB', background: '#FAFAFA',
    cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', flexDirection: 'column',
    alignItems: 'flex-start', gap: '3px',
  },
  typeBtnActive: {
    border: '2px solid #FF5200',
    background: '#FFF0EB',
    boxShadow: '0 0 0 3px rgba(255,82,0,0.1)',
  },
  typeBtnIcon: { fontSize: '1.4rem' },
  typeBtnLabel: { fontSize: '0.9rem', fontWeight: '700', color: '#1C1C1C' },
  typeBtnDesc: { fontSize: '0.75rem', color: '#9CA3AF' },
  priceWrap: { position: 'relative' },
  rupeeSymbol: {
    position: 'absolute', left: '12px', top: '50%',
    transform: 'translateY(-50%)', color: '#6B6B6B',
    fontSize: '0.9rem', fontWeight: '600',
  },
  submitRow: {
    padding: '24px 32px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '16px',
    flexWrap: 'wrap',
  },
  submitNote: { fontSize: '0.8rem', color: '#9CA3AF', flex: 1 },
  submitBtn: {
    padding: '13px 28px',
    background: 'linear-gradient(135deg, #FF5200, #FF6B35)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,82,0,0.3)',
    flexShrink: 0,
  },
  nonRestaurantWrap: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
  },
  welcomeCard: {
    background: 'white', borderRadius: '20px',
    padding: '48px 40px', maxWidth: '440px',
    textAlign: 'center', border: '1px solid #F0F0F0',
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
  },
  welcomeAvatar: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '1.8rem', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  welcomeName: {
    fontSize: '1.4rem', fontWeight: '700', color: '#1C1C1C',
    marginBottom: '8px', letterSpacing: '-0.02em',
  },
  welcomeRole: {
    display: 'inline-block',
    background: '#FFF0EB', color: '#FF5200',
    fontSize: '0.78rem', fontWeight: '600',
    padding: '3px 12px', borderRadius: '20px',
    textTransform: 'capitalize', marginBottom: '20px',
  },
  welcomeText: {
    fontSize: '0.9rem', color: '#6B6B6B',
    lineHeight: 1.7, marginBottom: '32px',
  },
  quickLinks: { display: 'flex', gap: '10px' },
  quickLink: {
    flex: 1, padding: '14px 10px', borderRadius: '12px',
    background: '#FAFAFA', border: '1.5px solid #E5E7EB',
    cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px',
  },
  quickLinkIcon: { fontSize: '1.4rem' },
  quickLinkLabel: { fontSize: '0.76rem', fontWeight: '600', color: '#374151' },
};

export default Dashboard;