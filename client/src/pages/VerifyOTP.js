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
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('https://aharasetu-backend-q6tj.onrender.com/api/auth/verify-otp', {
        email,
        otp: otpString
      });
      setMessage('✅ Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      await axios.post('https://aharasetu-backend-q6tj.onrender.com/api/auth/resend-otp', { email });
      setMessage('✅ New OTP sent to your email!');
      setTimer(600);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setResendLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📧 Verify Your Email</h2>
        <p style={styles.subtitle}>
          We sent a 6-digit OTP to
        </p>
        <p style={styles.email}>{email}</p>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <form onSubmit={handleSubmit}>
          {/* OTP Input Boxes */}
          <div style={styles.otpRow}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                style={{
                  ...styles.otpBox,
                  borderColor: digit ? '#2e7d32' : '#ccc',
                  backgroundColor: digit ? '#f1f8e9' : 'white',
                }}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Timer */}
          <div style={styles.timerBox}>
            {timer > 0 ? (
              <p style={styles.timer}>
                ⏳ OTP expires in <strong style={{ color: timer < 60 ? '#c62828' : '#2e7d32' }}>
                  {formatTime(timer)}
                </strong>
              </p>
            ) : (
              <p style={{ color: '#c62828', fontSize: '14px' }}>
                ❌ OTP expired! Please resend.
              </p>
            )}
          </div>

          <button
            style={{
              ...styles.btn,
              opacity: loading || timer === 0 ? 0.7 : 1,
              cursor: loading || timer === 0 ? 'not-allowed' : 'pointer'
            }}
            type="submit"
            disabled={loading || timer === 0}
          >
            {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
          </button>
        </form>

        {/* Resend OTP */}
        <div style={styles.resendBox}>
          <p style={styles.resendText}>Didn't receive the OTP?</p>
          <button
            style={styles.resendBtn}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? '⏳ Sending...' : '🔄 Resend OTP'}
          </button>
        </div>

        <p style={styles.bottom}>
          Wrong email? <Link to="/register" style={styles.link}>Register again</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '440px', textAlign: 'center' },
  title: { color: '#2e7d32', marginBottom: '5px' },
  subtitle: { color: '#888', fontSize: '14px', margin: '5px 0' },
  email: { color: '#2e7d32', fontWeight: 'bold', fontSize: '15px', marginBottom: '20px' },
  otpRow: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
  otpBox: { width: '48px', height: '56px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', border: '2px solid #ccc', outline: 'none', transition: 'all 0.2s', },
  timerBox: { marginBottom: '15px' },
  timer: { color: '#666', fontSize: '14px' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '5px' },
  resendBox: { marginTop: '20px', padding: '15px', backgroundColor: '#f9fbe7', borderRadius: '8px' },
  resendText: { color: '#666', fontSize: '13px', margin: '0 0 10px' },
  resendBtn: { padding: '8px 20px', backgroundColor: 'white', color: '#2e7d32', border: '2px solid #2e7d32', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  success: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' },
  bottom: { marginTop: '20px', fontSize: '14px', color: '#666' },
  link: { color: '#2e7d32', fontWeight: 'bold' },
};

export default VerifyOTP;