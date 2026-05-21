import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.notVerified) {
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🍱</div>
            <span style={styles.logoText}>AharaSetu</span>
          </div>
          <h2 style={styles.leftTitle}>
            Bridging surplus food<br />with people in need
          </h2>
          <p style={styles.leftSub}>
            Join thousands of restaurants, volunteers and NGOs making a difference every day.
          </p>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>500+</span>
              <span style={styles.statLbl}>Meals Saved</span>
            </div>
            <div style={styles.statDiv} />
            <div style={styles.stat}>
              <span style={styles.statNum}>50+</span>
              <span style={styles.statLbl}>Restaurants</span>
            </div>
            <div style={styles.statDiv} />
            <div style={styles.stat}>
              <span style={styles.statNum}>100+</span>
              <span style={styles.statLbl}>Volunteers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Welcome back 👋</h1>
            <p style={styles.formSub}>Sign in to your AharaSetu account</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
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
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <div style={styles.inputWrap}>
                <input
                  style={styles.input}
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
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
              {loading ? (
                <span style={styles.btnLoader}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.switchLink}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', minHeight: '100vh',
  },
  left: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(145deg, #1C1C1C 0%, #2D2D2D 100%)',
    padding: '60px 48px',
  },
  leftContent: { maxWidth: '400px' },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px',
  },
  logoIcon: {
    width: '42px', height: '42px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px',
  },
  logoText: {
    fontSize: '1.3rem', fontWeight: '700', color: 'white',
    letterSpacing: '-0.02em',
  },
  leftTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '700',
    color: 'white', lineHeight: 1.25, marginBottom: '16px',
    letterSpacing: '-0.02em',
  },
  leftSub: {
    fontSize: '1rem', color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7, marginBottom: '48px',
  },
  stats: {
    display: 'flex', alignItems: 'center', gap: '24px',
    padding: '20px 24px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statNum: { fontSize: '1.4rem', fontWeight: '700', color: '#FF5200' },
  statLbl: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' },
  statDiv: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' },
  right: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FAFAFA', padding: '40px 32px',
  },
  formCard: {
    width: '100%', maxWidth: '420px',
    background: 'white', borderRadius: '20px',
    padding: '40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    border: '1px solid #F0F0F0',
  },
  formHeader: { marginBottom: '28px' },
  formTitle: {
    fontSize: '1.6rem', fontWeight: '700',
    color: '#1C1C1C', letterSpacing: '-0.02em',
    marginBottom: '6px',
  },
  formSub: { fontSize: '0.9rem', color: '#9CA3AF' },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: '10px', padding: '12px 16px',
    fontSize: '0.875rem', color: '#DC2626',
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  forgotLink: { fontSize: '0.8rem', color: '#FF5200', fontWeight: '500' },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #E5E7EB', borderRadius: '10px',
    fontSize: '0.95rem', color: '#1C1C1C',
    outline: 'none', transition: 'border-color 0.15s',
    background: '#FAFAFA', boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none',
    fontSize: '1rem', cursor: 'pointer', padding: '4px',
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #FF5200, #FF6B35)',
    color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '0.95rem',
    fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,82,0,0.3)',
    transition: 'opacity 0.15s, transform 0.15s',
    marginTop: '4px',
  },
  btnLoader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  spinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white', borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  switchText: {
    textAlign: 'center', fontSize: '0.875rem',
    color: '#9CA3AF', marginTop: '24px',
  },
  switchLink: { color: '#FF5200', fontWeight: '600' },
};

export default Login;