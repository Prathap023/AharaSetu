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
      const res = await axios.get('http://localhost:5000/api/food');
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
        `http://localhost:5000/api/food/claim/${item._id}`, {},
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
  container: { padding: '30px', backgroundColor: '#f1f8e9', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#2e7d32', fontSize: '28px' },
  subtitle: { color: '#666', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  cardHeader: { marginBottom: '10px' },
  badge: { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  foodTitle: { color: '#1b5e20', fontSize: '20px', margin: '10px 0 5px' },
  description: { color: '#555', fontSize: '14px', marginBottom: '10px' },
  details: { backgroundColor: '#f9fbe7', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#444', marginBottom: '10px', lineHeight: '1.8' },
  contactBox: { backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#333', marginBottom: '15px', lineHeight: '1.8' },
  contactTitle: { fontWeight: 'bold', color: '#1b5e20', marginBottom: '5px' },
  btn: { width: '100%', padding: '10px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '60px', color: '#666' },
  center: { textAlign: 'center', padding: '60px' },
  message: { textAlign: 'center', padding: '10px', marginBottom: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', maxWidth: '400px', margin: '0 auto 20px' },
};

export default Home;