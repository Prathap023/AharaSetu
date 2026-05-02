import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchListings = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend.onrender.com/api/food');
      setListings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

useEffect(() => {
  fetchListings();

  // Auto refresh every 5 seconds
  const interval = setInterval(() => {
    fetchListings();
  }, 2000);

  return () => clearInterval(interval);
}, []);

  const handleClaim = async (item) => {
    if (!token) {
      alert('Please login to claim food!');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.put(
        `https://aharasetu-backend.onrender.com/api/food/claim/${item._id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (item.type === 'paid') {
        navigate(`/payment/${item._id}`);
      } else {
        setMessage('✅ Claim requested! Waiting for restaurant approval.');
        fetchListings();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Something went wrong!');
    }
  };

  if (loading) return (
    <div style={styles.center}><p>Loading food listings... 🍱</p></div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🍱 Available Food Listings</h2>
        <p style={styles.subtitle}>Find surplus food near you and help reduce waste</p>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {listings.length === 0 ? (
        <div style={styles.empty}>
          <p>😔 No food listings available right now.</p>
          <p>Check back later!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {listings.map(item => (
            <div key={item._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{
                  ...styles.badge,
                  backgroundColor: item.type === 'free' ? '#2e7d32' : '#1565c0'
                }}>
                  {item.type === 'free' ? '🆓 Free' : `💰 ₹${item.price}`}
                </span>
              </div>

              <h3 style={styles.foodTitle}>{item.title}</h3>
              <p style={styles.description}>{item.description}</p>

              <div style={styles.details}>
                <p>📦 Quantity: {item.quantity}</p>
                <p>⏰ Expires: {new Date(item.expiryTime).toLocaleString()}</p>
              </div>

              <div style={styles.contactBox}>
                <p style={styles.contactTitle}>🏪 Restaurant Info</p>
                <p>👤 {item.postedBy?.name}</p>
                <p>📍 {item.address}</p>
                <p>📞 {item.phone}</p>
                <p>📧 {item.contactEmail}</p>
              </div>

              <button
                style={styles.btn}
                onClick={() => handleClaim(item)}
              >
                {item.type === 'free' ? '🙏 Claim Food' : `💳 Claim & Pay ₹${item.price}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },

  header: {
    textAlign: 'center',
    marginBottom: '35px',
  },

  title: {
    color: '#1b5e20',
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '6px',
  },

  subtitle: {
    color: '#666',
    fontSize: '16px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1150px',
    margin: '0 auto',
  },

  card: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    transition: 'all 0.25s ease',
  },

  cardHeader: {
    marginBottom: '12px',
  },

  badge: {
    color: 'white',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },

  foodTitle: {
    color: '#1b5e20',
    fontSize: '20px',
    fontWeight: '600',
    margin: '10px 0 6px',
  },

  description: {
    color: '#555',
    fontSize: '14px',
    marginBottom: '12px',
    lineHeight: '1.6',
  },

  details: {
    backgroundColor: '#f9fbe7',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#444',
    marginBottom: '12px',
    lineHeight: '1.7',
  },

  contactBox: {
    background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#333',
    marginBottom: '16px',
    lineHeight: '1.7',
    border: '1px solid #dcedc8',
  },

  contactTitle: {
    fontWeight: '600',
    color: '#1b5e20',
    marginBottom: '6px',
  },

  btn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #43a047, #2e7d32)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },

  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#777',
    fontSize: '16px',
  },

  center: {
    textAlign: 'center',
    padding: '80px 20px',
  },

  message: {
    textAlign: 'center',
    padding: '12px',
    marginBottom: '20px',
    backgroundColor: '#e8f5e9',
    borderRadius: '10px',
    color: '#2e7d32',
    maxWidth: '420px',
    margin: '0 auto 20px',
    fontWeight: '500',
  },
};

export default Home;