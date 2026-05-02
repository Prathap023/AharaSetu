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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post('https://aharasetu-backend-q6tj.onrender.com/api/auth/login', form);
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🍱 Welcome Back!</h2>
        <p style={styles.subtitle}>Login to AharaSetu</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email"
              placeholder="Enter your email" value={form.email}
              onChange={handleChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password"
              placeholder="Enter your password" value={form.password}
              onChange={handleChange} required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.bottom}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
        <p style={styles.bottom}>
          <Link to="/forgot-password" style={styles.link}>Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title: { textAlign: 'center', color: '#2e7d32', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#888', marginBottom: '25px', fontSize: '14px' },
  field: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  bottom: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
  link: { color: '#2e7d32', fontWeight: 'bold' }
};

export default Login;