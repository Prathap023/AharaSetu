import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('❌ Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('❌ Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `https://aharasetu-backend.onrender.com/api/auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below</p>

        {error && <p style={styles.error}>{error}</p>}

        {done ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>✅ {message}</p>
            <p style={styles.successHint}>
              Redirecting to login in 3 seconds...
            </p>
            <Link to="/login" style={styles.backLink}>
              → Go to Login now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <div style={styles.passwordHints}>
              <p style={{ margin: '3px 0', color: password.length >= 6 ? '#2e7d32' : '#ccc' }}>
                {password.length >= 6 ? '✅' : '⭕'} At least 6 characters
              </p>
              <p style={{ margin: '3px 0', color: password === confirm && confirm !== '' ? '#2e7d32' : '#ccc' }}>
                {password === confirm && confirm !== '' ? '✅' : '⭕'} Passwords match
              </p>
            </div>

            <button
              style={{
                ...styles.btn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
            </button>

            <p style={styles.bottom}>
              Remember your password?{' '}
              <Link to="/login" style={styles.link}>Login here</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title: { textAlign: 'center', color: '#2e7d32', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: '25px', fontSize: '14px' },
  field: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  bottom: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
  link: { color: '#2e7d32', fontWeight: 'bold' },
  passwordHints: { backgroundColor: '#f9fbe7', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  successBox: { backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' },
  successText: { color: '#2e7d32', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px' },
  successHint: { color: '#555', fontSize: '13px', marginBottom: '15px' },
  backLink: { color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' },
};

export default ResetPassword;