import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ContactUs() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: '',
    role: user?.role || '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      const res = await fetch('https://formspree.io/f/mvzdnkzw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setForm({ name: user?.name || '', email: '', role: user?.role || '', subject: '', message: '' });
    } catch { setStatus('error'); }
    setLoading(false);
  };

  const subjects = [
    { value: '', label: 'Select a subject' },
    { value: 'Listing Issue', label: '🍱 Listing Issue' },
    { value: 'Payment Issue', label: '💳 Payment Issue' },
    { value: 'Refund Request', label: '💸 Refund Request' },
    { value: 'Claim Issue', label: '📦 Claim Issue' },
    { value: 'Account Issue', label: '👤 Account Issue' },
    { value: 'Feedback', label: '💬 Feedback' },
    { value: 'Other', label: '❓ Other' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>📬 Support</div>
            <h1 style={styles.heroTitle}>How can we <span style={styles.heroOrange}>help you?</span></h1>
            <p style={styles.heroSub}>Send us a message and we'll get back to you within 24 hours.</p>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Info Cards */}
          <div style={styles.leftCol}>
            {[
              { icon: '📧', label: 'Email Us', value: 'admin@aharasetu.com', sub: 'We reply within 24 hours' },
              { icon: '⏰', label: 'Response Time', value: 'Within 24 hours', sub: 'Mon–Sat, 9am–6pm' },
              { icon: '🏪', label: 'For Restaurants', value: 'Listing & payment support', sub: 'Approvals, refunds, issues' },
              { icon: '🤝', label: 'For Volunteers', value: 'Claim & pickup support', sub: 'Refunds, reports, help' },
            ].map((info, i) => (
              <div key={i} style={styles.infoCard}>
                <div style={styles.infoIcon}>{info.icon}</div>
                <div>
                  <p style={styles.infoLabel}>{info.label}</p>
                  <p style={styles.infoValue}>{info.value}</p>
                  <p style={styles.infoSub}>{info.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Send a Message</h2>
            <p style={styles.formSub}>Fill in the details below and we'll get back to you.</p>

            {status === 'success' && (
              <div style={styles.successBox}>
                <span style={styles.successIcon}>✅</span>
                <div>
                  <p style={styles.successTitle}>Message sent!</p>
                  <p style={styles.successSub}>Admin will respond within 24 hours.</p>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div style={styles.errorBox}>❌ Something went wrong. Please try again.</div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Your Name</label>
                  <input style={styles.input} type="text" name="name"
                    placeholder="Full name" value={form.name}
                    onChange={handleChange} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Your Role</label>
                  <select style={styles.input} name="role"
                    value={form.role} onChange={handleChange} required>
                    <option value="">Select role</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="ngo">NGO</option>
                    <option value="user">Regular User</option>
                  </select>
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input style={styles.input} type="email" name="email"
                  placeholder="your@email.com" value={form.email}
                  onChange={handleChange} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Subject</label>
                <select style={styles.input} name="subject"
                  value={form.subject} onChange={handleChange} required>
                  {subjects.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Message</label>
                <textarea style={{ ...styles.input, height: '130px', resize: 'vertical' }}
                  name="message" placeholder="Describe your issue in detail..."
                  value={form.message} onChange={handleChange} required />
              </div>
              <button style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
                type="submit" disabled={loading}>
                {loading ? 'Sending...' : '📨 Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' },
  hero: { background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)', borderRadius: '0 0 24px 24px', padding: '48px 40px', marginBottom: '40px', textAlign: 'center' },
  heroContent: { maxWidth: '500px', margin: '0 auto' },
  heroBadge: { display: 'inline-block', background: 'rgba(255,82,0,0.15)', border: '1px solid rgba(255,82,0,0.3)', color: '#FF8C00', fontSize: '0.75rem', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.06em', marginBottom: '16px' },
  heroTitle: { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '800', color: 'white', letterSpacing: '-0.03em', marginBottom: '10px' },
  heroOrange: { color: '#FF5200' },
  heroSub: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 },
  grid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoCard: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  infoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: '#FFF0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 },
  infoLabel: { fontSize: '0.68rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' },
  infoValue: { fontSize: '0.88rem', fontWeight: '600', color: '#1C1C1C', marginBottom: '2px' },
  infoSub: { fontSize: '0.74rem', color: '#9CA3AF' },
  formCard: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '4px' },
  formSub: { fontSize: '0.88rem', color: '#9CA3AF', marginBottom: '24px' },
  successBox: { display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' },
  successIcon: { fontSize: '1.1rem', flexShrink: 0 },
  successTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#16A34A', marginBottom: '2px' },
  successSub: { fontSize: '0.8rem', color: '#4ADE80' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', fontSize: '0.875rem', color: '#DC2626', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.92rem', color: '#1C1C1C', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' },
  submitBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,82,0,0.3)' },
};

export default ContactUs;