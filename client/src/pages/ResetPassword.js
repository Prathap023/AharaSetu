import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match!'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`https://aharasetu-backend-pov2.onrender.com/api/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>🔑</div>
        <h1 style={styles.title}>Set new password</h1>
        <p style={styles.sub}>Your new password must be at least 6 characters long.</p>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {done ? (
          <div style={styles.successState}>
            <div style={styles.successIcon}>🎉</div>
            <h3 style={styles.successTitle}>Password reset!</h3>
            <p style={styles.successText}>Redirecting to login in 3 seconds...</p>
            <Link to="/login" style={styles.backBtn}>Go to Login →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input} type="password"
                placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input} type="password"
                placeholder="Repeat new password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required
              />
            </div>
            <div style={styles.hints}>
              <div style={{ ...styles.hint, color: password.length >= 6 ? '#16A34A' : '#9CA3AF' }}>
                {password.length >= 6 ? '✅' : '○'} At least 6 characters
              </div>
              <div style={{ ...styles.hint, color: password === confirm && confirm ? '#16A34A' : '#9CA3AF' }}>
                {password === confirm && confirm ? '✅' : '○'} Passwords match
              </div>
            </div>
            <button
              style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
              type="submit" disabled={loading}
            >
              {loading ? 'Resetting...' : '🔐 Reset Password'}
            </button>
            <Link to="/login" style={styles.backLink}>← Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#FAFAFA',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', paddingTop: '80px',
  },
  card: {
    background: 'white', borderRadius: '20px',
    padding: '44px 40px', maxWidth: '420px', width: '100%',
    textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    border: '1px solid #F0F0F0',
  },
  iconWrap: {
    width: '64px', height: '64px', borderRadius: '18px',
    background: '#FFF0EB', margin: '0 auto 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
  },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '8px' },
  sub: { fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '24px', lineHeight: 1.6 },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '11px 14px', fontSize: '0.85rem', color: '#DC2626', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', color: '#1C1C1C', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' },
  hints: { display: 'flex', flexDirection: 'column', gap: '6px', background: '#F9FAFB', borderRadius: '8px', padding: '12px 14px' },
  hint: { fontSize: '0.82rem', fontWeight: '500' },
  submitBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,82,0,0.3)' },
  backLink: { display: 'block', textAlign: 'center', fontSize: '0.85rem', color: '#9CA3AF' },
  successState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  successIcon: { fontSize: '2.5rem' },
  successTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1C1C1C' },
  successText: { fontSize: '0.88rem', color: '#6B6B6B' },
  backBtn: { display: 'inline-block', marginTop: '8px', padding: '11px 24px', borderRadius: '10px', background: '#1C1C1C', color: 'white', fontSize: '0.88rem', fontWeight: '600' },
};

export default ResetPassword;