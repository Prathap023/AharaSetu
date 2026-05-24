import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function ReportIssue() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: '',
    role: user?.role || '',
    listingId: location.state?.listingId || '',
    listingTitle: location.state?.title || '',
    issueType: '',
    description: '',
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
        body: JSON.stringify({
          ...form,
          subject: `🚨 Issue Report - Listing ID: ${form.listingId}`,
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch { setStatus('error'); }
    setLoading(false);
  };

  const issueTypes = [
    '', 'Food Quality Issue', 'Food Not Provided',
    'Food Not Picked Up', 'Payment Issue',
    'Refund Not Received', 'Wrong Food Listed',
    'Restaurant Not Responding', 'Fraudulent Listing', 'Other'
  ];

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
          <div style={styles.headerBadge}>🚨 Report Issue</div>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>Report an Issue</h1>
          <p style={styles.sub}>Describe the problem and admin will investigate within 24 hours.</p>

          {status === 'success' ? (
            <div style={styles.successState}>
              <div style={styles.successIcon}>✅</div>
              <h3 style={styles.successTitle}>Report Submitted!</h3>
              <p style={styles.successText}>Admin will investigate and contact you within 24 hours.</p>
              <button style={styles.doneBtn} onClick={() => navigate(-1)}>← Go Back</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>

              {/* Listing Info */}
              <div style={styles.listingBox}>
                <p style={styles.listingBoxLabel}>📋 Listing Reference</p>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>🆔 Listing ID</label>
                    <input style={styles.input} type="text" name="listingId"
                      placeholder="Paste listing ID" value={form.listingId}
                      onChange={handleChange} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Food Title</label>
                    <input style={styles.input} type="text" name="listingTitle"
                      placeholder="Food item name" value={form.listingTitle}
                      onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Your Name</label>
                  <input style={styles.input} type="text" name="name"
                    value={form.name} onChange={handleChange} required />
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
                <label style={styles.label}>Issue Type</label>
                <select style={styles.input} name="issueType"
                  value={form.issueType} onChange={handleChange} required>
                  {issueTypes.map(t => (
                    <option key={t} value={t}>{t || 'Select issue type'}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                  name="description"
                  placeholder="Describe the issue in detail. Include dates, amounts, and any relevant information..."
                  value={form.description} onChange={handleChange} required />
              </div>

              <div style={styles.noteBox}>
                📌 Admin will investigate this report and contact you via email within 24 hours.
              </div>

              {status === 'error' && (
                <div style={styles.errorBox}>❌ Something went wrong. Please try again.</div>
              )}

              <div style={styles.btnRow}>
                <button type="button" style={styles.cancelBtn} onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
                  type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : '🚨 Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  wrap: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', fontSize: '0.88rem', color: '#9CA3AF', cursor: 'pointer', fontWeight: '500', padding: '6px 0' },
  headerBadge: { background: '#FEF2F2', color: '#DC2626', fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', border: '1px solid #FECACA' },
  card: { background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '6px' },
  sub: { fontSize: '0.88rem', color: '#9CA3AF', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  listingBox: { background: '#FFF8F5', border: '1px solid rgba(255,82,0,0.2)', borderRadius: '10px', padding: '16px', borderLeft: '3px solid #FF5200' },
  listingBoxLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#FF5200', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  row: { display: 'flex', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.92rem', color: '#1C1C1C', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' },
  noteBox: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '11px 14px', fontSize: '0.8rem', color: '#92400E', fontWeight: '500' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '11px 14px', fontSize: '0.84rem', color: '#DC2626' },
  btnRow: { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '12px', background: 'white', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '500', color: '#6B7280', cursor: 'pointer' },
  submitBtn: { flex: 2, padding: '12px', background: 'linear-gradient(135deg, #DC2626, #EF4444)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
  successState: { textAlign: 'center', padding: '20px 0' },
  successIcon: { fontSize: '3rem', marginBottom: '14px' },
  successTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#1C1C1C', marginBottom: '8px' },
  successText: { fontSize: '0.88rem', color: '#9CA3AF', marginBottom: '24px' },
  doneBtn: { padding: '11px 24px', borderRadius: '10px', background: '#1C1C1C', color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
};

export default ReportIssue;