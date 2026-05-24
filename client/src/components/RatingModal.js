import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

function RatingModal({ listing, onClose, onSaved }) {
  const { token } = useAuth();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await axios.get(
        `https://aharasetu-backend-pov2.onrender.com/api/ratings/my-rating/${listing._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setExisting(res.data);
        setStars(res.data.stars);
        setComment(res.data.comment || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (stars === 0) {
      setMessage('Please select a star rating!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `https://aharasetu-backend-pov2.onrender.com/api/ratings/listing/${listing._id}`,
        { stars, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Rating saved!');
      setTimeout(() => { onSaved(); onClose(); }, 1200);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Something went wrong'));
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>
              {existing ? 'Edit Your Rating' : 'Rate this Restaurant'}
            </h3>
            <p style={styles.subtitle}>{listing.title}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          <p style={styles.question}>How was your experience?</p>

          <div style={styles.starsWrap}>
            <StarRating value={stars} onChange={setStars} size="40px" />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Comment <span style={styles.optional}>(optional)</span>
            </label>
            <textarea
              style={styles.textarea}
              placeholder="Share your experience with this restaurant..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <span style={styles.charCount}>{comment.length}/300</span>
          </div>

          {message && (
            <p style={{
              ...styles.message,
              color: message.includes('✅') ? '#16a34a' : '#dc2626',
              background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
            }}>
              {message}
            </p>
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.skipBtn} onClick={onClose}>
            Skip for now
          </button>
          <button
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : existing ? '✏️ Update Rating' : '⭐ Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'white', borderRadius: '16px',
    width: '100%', maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '22px 24px 16px',
    borderBottom: '1px solid #f3f4f6',
  },
  title: { fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#6b7280', margin: 0 },
  closeBtn: {
    background: '#f3f4f6', border: 'none', borderRadius: '50%',
    width: '32px', height: '32px', cursor: 'pointer',
    fontSize: '14px', color: '#6b7280', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: '20px 24px' },
  question: { fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '14px' },
  starsWrap: {
    background: '#fafafa', border: '1px solid #f3f4f6',
    borderRadius: '10px', padding: '16px',
    display: 'flex', justifyContent: 'center',
    marginBottom: '18px',
  },
  field: { position: 'relative' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  optional: { fontWeight: '400', color: '#9ca3af' },
  textarea: {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', color: '#374151',
    resize: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', outline: 'none',
  },
  charCount: { position: 'absolute', bottom: '8px', right: '10px', fontSize: '11px', color: '#9ca3af' },
  message: { padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginTop: '12px' },
  footer: {
    display: 'flex', gap: '10px',
    padding: '16px 24px',
    borderTop: '1px solid #f3f4f6',
  },
  skipBtn: {
    flex: 1, padding: '11px',
    background: 'white', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px',
    color: '#6b7280', cursor: 'pointer', fontWeight: '500',
  },
  submitBtn: {
    flex: 2, padding: '11px',
    background: '#2e7d32', border: 'none',
    borderRadius: '8px', fontSize: '14px',
    color: 'white', fontWeight: '600',
  },
};

export default RatingModal;