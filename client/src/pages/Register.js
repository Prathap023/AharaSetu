import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('https://aharasetu-backend-pov2.onrender.com/api/auth/register', form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'user', label: 'Regular User', icon:<i class="fa-regular fa-user"></i>, desc: 'Browse and claim food' },
    { value: 'volunteer', label: 'Volunteer', icon: <i class="fa-regular fa-handshake"></i>, desc: 'Help distribute food' },
    { value: 'ngo', label: 'NGO', icon: <i class="fa-solid fa-building-ngo"></i>, desc: 'Organize food drives' },
    { value: 'restaurant', label: 'Restaurant', icon: <i class="fa-solid fa-utensils"></i>, desc: 'Share surplus food' },
  ];

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🍱</div>
            <span style={styles.logoText}>AharaSetu</span>
          </div>
          <h2 style={styles.leftTitle}>Make a difference,<br />one meal at a time.</h2>
          <p style={styles.leftSub}>
            Whether you're a restaurant with surplus food or a volunteer helping communities — AharaSetu connects you.
          </p>
          <div style={styles.features}>
            {[
              { icon: <i class="fa-solid fa-circle-check"></i>, text: 'Free to join and use' },
              { icon: <i class="fa-solid fa-lock"></i>, text: 'Secure OTP verification' },
              { icon: <i class="fa-solid fa-bolt"></i>, text: 'Real-time notifications' },
              { icon: <i class="fa-solid fa-credit-card"></i>, text: 'Safe Stripe payments' },
            ].map((f, i) => (
              <div key={i} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Create an account</h1>
            <p style={styles.formSub}>Join the AharaSetu community today</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>I am joining as...</label>
              <div style={styles.roleGrid}>
                {roles.map(role => (
                  <div
                    key={role.value}
                    style={{
                      ...styles.roleCard,
                      ...(form.role === role.value ? styles.roleCardActive : {})
                    }}
                    onClick={() => setForm({ ...form, role: role.value })}
                  >
                    <span style={styles.roleIcon}>{role.icon}</span>
                    <span style={styles.roleLabel}>{role.label}</span>
                    <span style={styles.roleDesc}>{role.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.75 : 1,
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(145deg, #1C1C1C 0%, #2D2D2D 100%)',
    padding: '60px 48px',
  },
  leftContent: { maxWidth: '400px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' },
  logoIcon: {
    width: '42px', height: '42px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
  },
  logoText: { fontSize: '1.3rem', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' },
  leftTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '700',
    color: 'white', lineHeight: 1.25, marginBottom: '16px', letterSpacing: '-0.02em',
  },
  leftSub: { fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '40px' },
  features: { display: 'flex', flexDirection: 'column', gap: '14px' },
  feature: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: '#FF5200', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0,
  },
  featureText: { fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' },
  right: {
    flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FAFAFA', padding: '40px 32px', overflowY: 'auto',
  },
  formCard: {
    width: '100%', maxWidth: '480px', background: 'white',
    borderRadius: '20px', padding: '40px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid #F0F0F0',
  },
  formHeader: { marginBottom: '28px' },
  formTitle: {
    fontSize: '1.6rem', fontWeight: '700', color: '#1C1C1C',
    letterSpacing: '-0.02em', marginBottom: '6px',
  },
  formSub: { fontSize: '0.9rem', color: '#9CA3AF' },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: '10px', padding: '12px 16px',
    fontSize: '0.875rem', color: '#DC2626',
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input: {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #E5E7EB', borderRadius: '10px',
    fontSize: '0.95rem', color: '#1C1C1C', outline: 'none',
    background: '#FAFAFA', boxSizing: 'border-box',
  },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  roleCard: {
    padding: '14px', borderRadius: '10px',
    border: '1.5px solid #E5E7EB', background: '#FAFAFA',
    cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', flexDirection: 'column', gap: '3px',
  },
  roleCardActive: {
    border: '1.5px solid #FF5200',
    background: '#FFF0EB',
    boxShadow: '0 0 0 3px rgba(255,82,0,0.1)',
  },
  roleIcon: { fontSize: '1.3rem', marginBottom: '2px' },
  roleLabel: { fontSize: '0.82rem', fontWeight: '600', color: '#1C1C1C' },
  roleDesc: { fontSize: '0.72rem', color: '#9CA3AF' },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #FF5200, #FF6B35)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,82,0,0.3)',
  },
  switchText: { textAlign: 'center', fontSize: '0.875rem', color: '#9CA3AF', marginTop: '24px' },
  switchLink: { color: '#FF5200', fontWeight: '600' },
};

export default Register;