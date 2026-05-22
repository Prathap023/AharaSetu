import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(600);

  useEffect(() => {
    if (!email) { navigate('/register'); return; }
    const interval = setInterval(() => {
      setTimer(prev => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp: otpString });
      setMessage('✅ Email verified!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true); setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      setMessage('✅ New OTP sent!');
      setTimer(600); setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    }
    setResendLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>📧</span>
        </div>
        <h1 style={styles.title}>Check your email</h1>
        <p style={styles.sub}>We sent a 6-digit code to</p>
        <p style={styles.email}>{email}</p>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        {message && <div style={styles.successBox}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i} id={`otp-${i}`}
                style={{
                  ...styles.otpBox,
                  borderColor: digit ? '#FF5200' : '#E5E7EB',
                  background: digit ? '#FFF0EB' : '#FAFAFA',
                }}
                type="text" maxLength="1" value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <div style={styles.timerRow}>
            {timer > 0 ? (
              <p style={styles.timer}>
                Code expires in{' '}
                <span style={{ color: timer < 60 ? '#DC2626' : '#FF5200', fontWeight: '700' }}>
                  {formatTime(timer)}
                </span>
              </p>
            ) : (
              <p style={{ color: '#DC2626', fontSize: '0.85rem' }}>Code expired. Please resend.</p>
            )}
          </div>

          <button
            style={{ ...styles.submitBtn, opacity: loading || timer === 0 ? 0.7 : 1 }}
            type="submit" disabled={loading || timer === 0}
          >
            {loading ? 'Verifying...' : 'Verify Email →'}
          </button>
        </form>

        <div style={styles.resendRow}>
          <span style={styles.resendText}>Didn't receive the code?</span>
          <button
            style={styles.resendBtn}
            onClick={handleResend} disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <Link to="/register" style={styles.backLink}>← Wrong email? Go back</Link>
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem',
  },
  icon: { fontSize: '1.8rem' },
  title: {
    fontSize: '1.5rem', fontWeight: '800', color: '#1C1C1C',
    letterSpacing: '-0.02em', marginBottom: '8px',
  },
  sub: { fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '4px' },
  email: { fontSize: '0.95rem', fontWeight: '600', color: '#FF5200', marginBottom: '24px' },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: '10px', padding: '11px 14px',
    fontSize: '0.85rem', color: '#DC2626', marginBottom: '16px',
  },
  successBox: {
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    borderRadius: '10px', padding: '11px 14px',
    fontSize: '0.85rem', color: '#16A34A', marginBottom: '16px',
  },
  otpRow: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' },
  otpBox: {
    width: '48px', height: '56px', textAlign: 'center',
    fontSize: '1.4rem', fontWeight: '700',
    border: '2px solid #E5E7EB', borderRadius: '12px',
    outline: 'none', transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  timerRow: { marginBottom: '20px' },
  timer: { fontSize: '0.85rem', color: '#9CA3AF' },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #FF5200, #FF6B35)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,82,0,0.3)',
  },
  resendRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', marginTop: '20px',
  },
  resendText: { fontSize: '0.85rem', color: '#9CA3AF' },
  resendBtn: {
    background: 'none', border: 'none',
    color: '#FF5200', fontSize: '0.85rem',
    fontWeight: '600', cursor: 'pointer',
  },
  backLink: {
    display: 'block', marginTop: '16px',
    fontSize: '0.82rem', color: '#9CA3AF',
  },
};

export default VerifyOTP;