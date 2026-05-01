import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function ReportIssue() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const prefillListingId = location.state?.listingId || '';
  const prefillTitle = location.state?.title || '';

  const [form, setForm] = useState({
    name: user?.name || '',
    email: '',
    role: user?.role || '',
    listingId: prefillListingId,
    listingTitle: prefillTitle,
    issueType: '',
    description: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('https://formspree.io/f/mvzdnkzw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          subject: `🚨 Issue Report - Listing ID: ${form.listingId}`,
          listingId: form.listingId,
          listingTitle: form.listingTitle,
          issueType: form.issueType,
          description: form.description,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setForm({
          name: user?.name || '',
          email: '',
          role: user?.role || '',
          listingId: '',
          listingTitle: '',
          issueType: '',
          description: '',
        });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>🚨 Report an Issue</h2>
          <p style={styles.subtitle}>
            Report any problems with food listings or orders to admin
          </p>
        </div>

        {status === 'success' && (
          <div style={styles.successBox}>
            <p style={styles.successText}>
              ✅ Issue reported successfully! Admin will look into it within 24 hours.
            </p>
            <button style={styles.backBtn} onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>❌ Something went wrong. Please try again!</p>
          </div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit}>
            {/* Listing Info */}
            <div style={styles.listingBox}>
              <p style={styles.listingBoxTitle}>📋 Listing Information</p>
              <div style={styles.row}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>🆔 Listing ID</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="listingId"
                    placeholder="Paste listing ID here"
                    value={form.listingId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Food Title</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="listingTitle"
                    placeholder="Food item name"
                    value={form.listingTitle}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Reporter Info */}
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Your Name</label>
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Your Role</label>
                <select
                  style={styles.input}
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select role</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo">NGO</option>
                  <option value="user">Regular User</option>
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Your Email</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="Your email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Issue Type</label>
              <select
                style={styles.input}
                name="issueType"
                value={form.issueType}
                onChange={handleChange}
                required
              >
                <option value="">Select issue type</option>
                <option value="Food Quality Issue">🍱 Food Quality Issue</option>
                <option value="Food Not Provided">❌ Food Not Provided</option>
                <option value="Food Not Picked Up">📦 Food Not Picked Up</option>
                <option value="Payment Issue">💳 Payment Issue</option>
                <option value="Refund Not Received">💸 Refund Not Received</option>
                <option value="Wrong Food Listed">⚠️ Wrong Food Listed</option>
                <option value="Restaurant Not Responding">📵 Restaurant Not Responding</option>
                <option value="Fraudulent Listing">🚫 Fraudulent Listing</option>
                <option value="Other">❓ Other</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, height: '130px', resize: 'vertical' }}
                name="description"
                placeholder="Describe the issue in detail. Include any relevant information like dates, amounts, etc."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.noteBox}>
              <p style={styles.noteText}>
                📌 Note: Admin will investigate this report and contact you via email within 24 hours.
              </p>
            </div>

            <div style={styles.btnRow}>
              <button
                style={styles.cancelBtn}
                type="button"
                onClick={() => navigate(-1)}
              >
                ← Cancel
              </button>
              <button
                style={{
                  ...styles.btn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? '⏳ Submitting...' : '🚨 Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', backgroundColor: '#f1f8e9', minHeight: '100vh', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '650px', height: 'fit-content' },
  header: { textAlign: 'center', marginBottom: '25px' },
  title: { color: '#c62828', fontSize: '26px', marginBottom: '5px' },
  subtitle: { color: '#666', fontSize: '14px' },
  listingBox: { backgroundColor: '#f9fbe7', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #c8e6c9' },
  listingBoxTitle: { color: '#2e7d32', fontWeight: 'bold', margin: '0 0 10px' },
  field: { marginBottom: '18px' },
  row: { display: 'flex', gap: '15px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '10px' },
  btn: { flex: 2, padding: '12px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  noteBox: { backgroundColor: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '10px' },
  noteText: { color: '#e65100', fontSize: '13px', margin: 0 },
  successBox: { backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' },
  successText: { color: '#2e7d32', fontWeight: 'bold', marginBottom: '15px' },
  errorBox: { backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  errorText: { color: '#c62828', margin: 0, fontWeight: 'bold' },
  backBtn: { padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

export default ReportIssue;