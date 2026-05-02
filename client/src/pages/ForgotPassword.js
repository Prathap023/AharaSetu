import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/forgot-password',
        { email }
      );
      setMessage(res.data.message);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Forgot Password</h2>
        <p style={styles.subtitle}>
          Enter your email and we'll send you a reset link
        </p>

        {error && <p style={styles.error}>{error}</p>}

        {sent ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>📧 {message}</p>
            <p style={styles.successHint}>
              Check your inbox and click the reset link.
              The link expires in <strong>15 minutes</strong>.
            </p>
            <Link to="/login" style={styles.backLink}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              style={styles.btn}
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
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
  successBox: { backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' },
  successText: { color: '#2e7d32', fontWeight: 'bold', fontSize: '15px', marginBottom: '10px' },
  successHint: { color: '#555', fontSize: '13px', marginBottom: '15px' },
  backLink: { color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' },
};

export default ForgotPassword;