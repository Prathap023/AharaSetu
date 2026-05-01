import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function MyClaims() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

 useEffect(() => {
  if (!user) { navigate('/login'); return; }
  fetchClaims();

  // Auto refresh every 5 seconds
  const interval = setInterval(() => {
    fetchClaims();
  }, 2000);

  return () => clearInterval(interval);
}, []);

  const fetchClaims = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/food/my-claims', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handlePickedUp = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/food/volunteer-pickedup/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Marked as picked up!');
      fetchClaims();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const getAcknowledgementStatus = (item) => {
    if (item.status !== 'claimed' && item.status !== 'completed') return null;
    if (item.adminCompleted) return { text: '🎉 Transaction Completed!', color: '#2e7d32' };
    if (item.volunteerPickedUp && !item.restaurantProvided)
      return { text: '✅ You picked up — waiting for restaurant to acknowledge', color: '#f57f17' };
    if (!item.volunteerPickedUp && item.restaurantProvided)
      return { text: '⚠️ Restaurant has provided the food — please acknowledge pickup!', color: '#c62828' };
    if (item.restaurantProvided && item.volunteerPickedUp)
      return { text: '✅ Both acknowledged — waiting for admin to complete', color: '#1565c0' };
    return { text: '⏳ Waiting for both acknowledgements', color: '#666' };
  };

  const getStatusInfo = (item) => {
    if (item.status === 'completed') return { text: '🎉 Completed', color: '#2e7d32' };
    if (item.status === 'pending_payment') return { text: '💳 Payment Required', color: '#1565c0' };
    if (item.status === 'pending_restaurant_approval') return { text: '⏳ Waiting for Restaurant Approval', color: '#f57f17' };
    if (item.status === 'claimed') return { text: '📦 Claimed', color: '#1565c0' };
    if (item.restaurantRejected) return { text: '❌ Rejected - Refunded', color: '#c62828' };
    return { text: item.status, color: '#666' };
  };

  if (loading) return <div style={styles.center}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 My Claims</h2>
        <p style={styles.subtitle}>Track the food you have claimed</p>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {claims.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't claimed any food yet.</p>
          <button style={styles.btn} onClick={() => navigate('/')}>Browse Food</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {claims.map(item => {
            const statusInfo = getStatusInfo(item);
            const ackStatus = getAcknowledgementStatus(item);
            return (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <h3 style={styles.foodTitle}>{item.title}</h3>
                  <span style={{ ...styles.badge, backgroundColor: statusInfo.color }}>
                    {statusInfo.text}
                  </span>
                </div>

                <div style={styles.details}>
                  <p>📦 Quantity: {item.quantity}</p>
                  <p>🆔 Listing ID: <span style={
                    {fontFamily:'monospace', backgroundColor:'#e8f5e9', padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}
                  }>{item._id}</span></p>
                  <p>💰 Type: {item.type === 'free' ? 'Free' : `Paid - ₹${item.price}`}</p>
                  <p>⏰ Expires: {new Date(item.expiryTime).toLocaleString()}</p>
                  {item.paymentDone && <p>✅ Payment ID: {item.paymentId}</p>}
                </div>

                <div style={styles.restaurantBox}>
                  <p style={styles.restaurantTitle}>🏪 Restaurant Details</p>
                  <p>👤 {item.postedBy?.name}</p>
                  <p>📧 {item.postedBy?.email}</p>
                  <p>📞 {item.postedBy?.phone || 'Not provided'}</p>
                  <p>📍 {item.address}</p>
                </div>
                <button
                  style={styles.reportBtn}
                  onClick={() => navigate('/report', {
                    state: {
                      listingId: item._id,
                      title: item.title
                    }
                  })}>
                  🚨 Report Issue
                </button>

                {item.status === 'pending_payment' && (
                  <button style={styles.payBtn}
                    onClick={() => navigate(`/payment/${item._id}`)}>
                    💳 Pay Now - ₹{item.price}
                  </button>
                )}

                {ackStatus && (
                  <div style={{
                    ...styles.ackBox,
                    backgroundColor: ackStatus.color + '22',
                    borderLeft: `4px solid ${ackStatus.color}`
                  }}>
                    <p style={{ color: ackStatus.color, fontWeight: 'bold', margin: 0 }}>
                      {ackStatus.text}
                    </p>
                  </div>
                )}

                {item.status === 'claimed' && !item.volunteerPickedUp && (
                  <button style={styles.pickedUpBtn}
                    onClick={() => handlePickedUp(item._id)}>
                    ✅ I Have Picked Up the Food
                  </button>
                )}

                {item.status === 'claimed' && item.volunteerPickedUp && (
                  <p style={styles.doneText}>✅ You have acknowledged picking up the food</p>
                )}
              </div>
            );
          })}
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' },
  foodTitle: { color: '#1b5e20', fontSize: '18px', margin: 0 },
  badge: { color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  details: { backgroundColor: '#f9fbe7', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#444', marginBottom: '10px', lineHeight: '1.8' },
  restaurantBox: { backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#333', marginBottom: '10px', lineHeight: '1.8' },
  restaurantTitle: { fontWeight: 'bold', marginBottom: '5px', color: '#1b5e20' },
  payBtn: { width: '100%', padding: '12px', backgroundColor: '#635bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', marginBottom: '10px' },
  pickedUpBtn: { width: '100%', padding: '10px', backgroundColor: '#e65100', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '10px' },
  ackBox: { padding: '10px', borderRadius: '8px', marginTop: '10px', marginBottom: '10px' },
  doneText: { color: '#2e7d32', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' },
  message: { textAlign: 'center', padding: '10px', marginBottom: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', maxWidth: '400px', margin: '0 auto 20px' },
  empty: { textAlign: 'center', padding: '60px', color: '#666' },
  center: { textAlign: 'center', padding: '60px' },
  reportBtn: { width: '100%', padding: '10px', backgroundColor: '#fff3e0', color: '#e65100', border: '2px solid #e65100', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '10px', fontWeight: 'bold' },
  btn: { padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' },
};

export default MyClaims;