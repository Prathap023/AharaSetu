import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post('https://aharasetu-backend-pov2.onrender.com/api/auth/login', form);
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
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row' }}>

      {/* Left Panel — hidden on mobile */}
      {!isMobile && (
        <div style={s.left}>
          <div style={s.leftContent}>
            <div style={s.logo}>
              <div style={s.logoIcon}>🍱</div>
              <span style={s.logoText}>AharaSetu</span>
            </div>
            <h2 style={s.leftTitle}>Bridging surplus food<br />with people in need</h2>
            <p style={s.leftSub}>
              Join thousands of restaurants, volunteers and NGOs making a difference every day.
            </p>
            <div style={s.stats}>
              {[
                { num: '500+', lbl: 'Meals Saved' },
                { num: '50+', lbl: 'Restaurants' },
                { num: '100+', lbl: 'Volunteers' },
              ].map((s2, i) => (
                <div key={i} style={s.stat}>
                  <span style={s.statNum}>{s2.num}</span>
                  <span style={s.statLbl}>{s2.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Right Panel */}
      <div style={{ ...s.right, padding: isMobile ? '24px 20px' : '40px 32px' }}>

        {/* Mobile brand */}
        {isMobile && (
          <div style={s.mobileBrand}>
            <div style={s.logoIcon}>🍱</div>
            <span style={s.logoText}>AharaSetu</span>
          </div>
        )}

        <div style={{ ...s.formCard, padding: isMobile ? '28px 20px' : '40px', boxShadow: isMobile ? 'none' : '0 4px 32px rgba(0,0,0,0.08)', border: isMobile ? 'none' : '1px solid #F0F0F0' }}>
          <div style={s.formHeader}>
            <h1 style={s.formTitle}>Welcome back</h1>
            <p style={s.formSub}>Sign in to your AharaSetu account</p>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" name="email"
                placeholder="you@example.com" value={form.email}
                onChange={handleChange} required />
            </div>

            <div style={s.field}>
              <div style={s.labelRow}>
                <label style={s.label}>Password</label>
                <Link to="/forgot-password" style={s.forgotLink}>Forgot password?</Link>
              </div>
              <div style={s.inputWrap}>
                <input style={s.input} type={showPass ? 'text' : 'password'}
                  name="password" placeholder="Enter your password"
                  value={form.password} onChange={handleChange} required />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <i class="fa-regular fa-eye"></i> : <i class="fa-regular fa-eye-slash"></i>}
                </button>
              </div>
            </div>

            <button style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
              type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={s.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={s.switchLink}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  left: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #1C1C1C 0%, #2D2D2D 100%)', padding: '60px 48px' },
  leftContent: { maxWidth: '400px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' },
  logoIcon: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF5200, #FF8C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  logoText: { fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' },
  leftTitle: { fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: '700', color: 'white', lineHeight: 1.25, marginBottom: '16px', letterSpacing: '-0.02em' },
  leftSub: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '40px' },
  stats: { display: 'flex', alignItems: 'center', gap: '20px', padding: '18px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statNum: { fontSize: '1.3rem', fontWeight: '700', color: '#FF5200' },
  statLbl: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#FAFAFA' },
  mobileBrand: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', alignSelf: 'flex-start' },
  formCard: { width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px' },
  formHeader: { marginBottom: '24px' },
  formTitle: { fontSize: '1.55rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '5px' },
  formSub: { fontSize: '0.88rem', color: '#9CA3AF' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', fontSize: '0.86rem', color: '#DC2626', marginBottom: '18px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '0.84rem', fontWeight: '600', color: '#374151' },
  forgotLink: { fontSize: '0.8rem', color: '#FF5200', fontWeight: '500' },
  inputWrap: { position: 'relative' },
  input: { width: '100%', padding: '13px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '16px', color: '#1C1C1C', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: '4px' },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,82,0,0.3)', marginTop: '4px' },
  switchText: { textAlign: 'center', fontSize: '0.875rem', color: '#9CA3AF', marginTop: '22px' },
  switchLink: { color: '#FF5200', fontWeight: '600' },
};

export default Login;