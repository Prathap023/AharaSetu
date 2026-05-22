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
          subject: form.subject,
          message: form.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setForm({
          name: user?.name || '',
          email: '',
          role: user?.role || '',
          subject: '',
          message: '',
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
      <div style={styles.left}>
        <h2 style={styles.leftTitle}>📬 Get in Touch</h2>
        <p style={styles.leftSubtitle}>
          Have a question, complaint or suggestion? We're here to help!
        </p>

        <div style={styles.infoBox}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📧</span>
            <div>
              <p style={styles.infoLabel}>Email Us</p>
              <p style={styles.infoValue}>admin@aharasetu.com <del>this mail not working as of now</del></p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>⏰</span>
            <div>
              <p style={styles.infoLabel}>Response Time</p>
              <p style={styles.infoValue}>Within 24 hours</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🏪</span>
            <div>
              <p style={styles.infoLabel}>For Restaurants</p>
              <p style={styles.infoValue}>Listing issues, approvals, payments</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🤝</span>
            <div>
              <p style={styles.infoLabel}>For Volunteers & NGOs</p>
              <p style={styles.infoValue}>Claim issues, refunds, support</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>✉️ Send us a Message</h3>
          <p style={styles.cardSubtitle}>Admin will get back to you within 24 hours</p>

          {status === 'success' && (
            <div style={styles.successBox}>
              <p style={styles.successText}>
                ✅ Message sent successfully! Admin will respond within 24 hours.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div style={styles.errorBox}>
              <p style={styles.errorText}>
                ❌ Something went wrong. Please try again!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Your Name</label>
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  placeholder="Your full name"
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
              <label style={styles.label}>Subject</label>
              <select
                style={styles.input}
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a subject</option>
                <option value="Listing Issue">🍱 Listing Issue</option>
                <option value="Payment Issue">💳 Payment Issue</option>
                <option value="Refund Request">💸 Refund Request</option>
                <option value="Claim Issue">📦 Claim Issue</option>
                <option value="Account Issue">👤 Account Issue</option>
                <option value="Feedback">💬 Feedback</option>
                <option value="Other">❓ Other</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Message</label>
              <textarea
                style={{ ...styles.input, height: '130px', resize: 'vertical' }}
                name="message"
                placeholder="Describe your issue or message in detail..."
                value={form.message}
                onChange={handleChange}
                required
              />
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
              {loading ? '⏳ Sending...' : '📨 Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '30px', padding: '40px', backgroundColor: '#f1f8e9', minHeight: '100vh', flexWrap: 'wrap' },
  left: { flex: 1, minWidth: '280px' },
  leftTitle: { color: '#2e7d32', fontSize: '28px', marginBottom: '10px' },
  leftSubtitle: { color: '#666', fontSize: '15px', marginBottom: '30px' },
  infoBox: { display: 'flex', flexDirection: 'column', gap: '20px' },
  infoItem: { display: 'flex', alignItems: 'flex-start', gap: '15px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  infoIcon: { fontSize: '28px' },
  infoLabel: { color: '#888', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 'bold' },
  infoValue: { color: '#333', fontSize: '14px', margin: 0 },
  right: { flex: 2, minWidth: '320px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  cardTitle: { color: '#2e7d32', marginBottom: '5px' },
  cardSubtitle: { color: '#888', fontSize: '14px', marginBottom: '25px' },
  field: { marginBottom: '18px' },
  row: { display: 'flex', gap: '15px' },
  label: { display: 'block', marginBottom: '6px', color: '#444', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '5px' },
  successBox: { backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  successText: { color: '#2e7d32', margin: 0, fontWeight: 'bold' },
  errorBox: { backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  errorText: { color: '#c62828', margin: 0, fontWeight: 'bold' },
};

export default ContactUs;