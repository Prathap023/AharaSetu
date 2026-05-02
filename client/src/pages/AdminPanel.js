import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

 useEffect(() => {
  if (!user || user.role !== 'admin') {
    navigate('/login');
    return;
  }
  fetchListings();

  // Auto refresh every 5 seconds
  const interval = setInterval(() => {
    fetchListings();
  }, 2000);

  return () => clearInterval(interval);
}, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend.onrender.com/api/food/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend.onrender.com/api/food/admin/approve/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Listing approved!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend.onrender.com/api/food/admin/reject/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('❌ Listing rejected!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend.onrender.com/api/food/admin/complete/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('🎉 Transaction marked as completed!');
      fetchListings();
    } catch (err) { setMessage('❌ ' + (err.response?.data?.message || 'Something went wrong!')); }
  };

  const getAcknowledgementStatus = (item) => {
    if (item.status !== 'claimed' && item.status !== 'completed') return null;
    if (item.adminCompleted) return { text: '🎉 Transaction Completed', color: '#2e7d32' };
    if (item.restaurantProvided && item.volunteerPickedUp)
      return { text: '🔔 Both acknowledged — Ready to Complete!', color: '#6a1b9a' };
    if (item.restaurantProvided && !item.volunteerPickedUp)
      return { text: '⏳ Restaurant provided — Waiting for volunteer pickup', color: '#f57f17' };
    if (!item.restaurantProvided && item.volunteerPickedUp)
      return { text: '⏳ Volunteer picked up — Waiting for restaurant acknowledgement', color: '#e65100' };
    return { text: '⏳ Waiting for both to acknowledge', color: '#666' };
  };

  const getStatusBadge = (item) => {
    if (item.status === 'completed') return { text: '🎉 Completed', color: '#2e7d32' };
    if (item.adminRejected) return { text: '❌ Rejected', color: '#c62828' };
    if (item.adminApproved && item.status === 'available') return { text: '✅ Live', color: '#2e7d32' };
    if (item.adminApproved && item.status === 'claimed') return { text: '📦 Claimed', color: '#1565c0' };
    if (item.adminApproved && item.status === 'pending_payment') return { text: '💳 Pending Payment', color: '#1565c0' };
    if (item.adminApproved && item.status === 'pending_restaurant_approval') return { text: '⏳ Pending Restaurant Approval', color: '#f57f17' };
    return { text: '⏳ Pending Admin Review', color: '#f57f17' };
  };

  const filteredListings = listings.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.adminApproved && !item.adminRejected;
    if (filter === 'approved') return item.adminApproved && item.status !== 'completed';
    if (filter === 'rejected') return item.adminRejected === true;
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'action') return item.restaurantProvided && item.volunteerPickedUp && !item.adminCompleted;
    return true;
  });

  if (loading) return <div style={styles.center}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🛡️ Admin Panel</h2>
        <p style={styles.subtitle}>Manage all food listings and transactions</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{listings.length}</p>
          <p style={styles.statLabel}>Total Listings</p>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{listings.filter(i => !i.adminApproved && !i.adminRejected).length}</p>
          <p style={styles.statLabel}>Pending Review</p>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{listings.filter(i => i.restaurantProvided && i.volunteerPickedUp && !i.adminCompleted).length}</p>
          <p style={styles.statLabel}>Ready to Complete</p>
        </div>
        <div style={styles.statBox}>
          <p style={styles.statNum}>{listings.filter(i => i.status === 'completed').length}</p>
          <p style={styles.statLabel}>Completed</p>
        </div>
        <div style={{ ...styles.statBox, borderTop: '3px solid #c62828' }}>
          <p style={{ ...styles.statNum, color: '#c62828' }}>{listings.filter(i => i.adminRejected).length}</p>
          <p style={styles.statLabel}>Rejected</p>
        </div>
      </div>

      <div style={styles.filterRow}>
      {[
        { key: 'all', label: '📋 All', color: '#2e7d32' },
        { key: 'pending', label: '⏳ Pending', color: '#f57f17' },
        { key: 'approved', label: '✅ Approved', color: '#2e7d32' },
        { key: 'rejected', label: '❌ Rejected', color: '#c62828' },
        { key: 'action', label: '🔔 Action Needed', color: '#6a1b9a' },
        { key: 'completed', label: '🎉 Completed', color: '#1565c0' },
      ].map(f => (
        <button key={f.key} style={{
          ...styles.filterBtn,
          backgroundColor: filter === f.key ? f.color : 'white',
          color: filter === f.key ? 'white' : f.color,
          borderColor: f.color,
        }} onClick={() => setFilter(f.key)}>
          {f.label}
        </button>
      ))}
    </div>

      {message && <p style={styles.message}>{message}</p>}

      {filteredListings.length === 0 ? (
        <div style={styles.empty}><p>No listings found for this filter.</p></div>
      ) : (
        <div style={styles.grid}>
          {filteredListings.map(item => {
            const badge = getStatusBadge(item);
            const ackStatus = getAcknowledgementStatus(item);
            return (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <h3 style={styles.foodTitle}>{item.title}</h3>
                  <span style={{ ...styles.badge, backgroundColor: badge.color }}>
                    {badge.text}
                  </span>
                </div>

                <p style={styles.description}>{item.description}</p>

                <div style={styles.details}>
                  <p>🆔 Listing ID: <span style={
                    {fontFamily:'monospace', backgroundColor:'#e8f5e9', padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}
                  }>{item._id}</span></p>
                  <p>📦 Quantity: {item.quantity}</p>
                  <p>💰 Type: {item.type === 'free' ? 'Free' : `Paid - ₹${item.price}`}</p>
                  <p>⏰ Expires: {new Date(item.expiryTime).toLocaleString()}</p>
                  <p>📍 Address: {item.address}</p>
                  <p>📞 Phone: {item.phone}</p>
                  <p>📧 Contact: {item.contactEmail}</p>
                  <p>🏪 Posted by: {item.postedBy?.name} ({item.postedBy?.email})</p>
                  {item.claimedBy && <p>👤 Claimed by: {item.claimedBy?.name} ({item.claimedBy?.email})</p>}
                </div>

                {ackStatus && (
                  <div style={{
                    ...styles.ackBox,
                    backgroundColor: ackStatus.color + '22',
                    borderLeft: `4px solid ${ackStatus.color}`
                  }}>
                    <p style={{ color: ackStatus.color, fontWeight: 'bold', margin: 0 }}>
                      {ackStatus.text}
                    </p>
                    <div style={styles.ackChecks}>
                      <span style={{ color: item.restaurantProvided ? '#2e7d32' : '#ccc' }}>
                        🏪 Restaurant: {item.restaurantProvided ? '✅ Provided' : '⏳ Pending'}
                      </span>
                      <span style={{ color: item.volunteerPickedUp ? '#2e7d32' : '#ccc' }}>
                        👤 Volunteer: {item.volunteerPickedUp ? '✅ Picked Up' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                )}

                {!item.adminApproved && !item.adminRejected && (
                  <div style={styles.btnRow}>
                    <button style={styles.approveBtn} onClick={() => handleApprove(item._id)}>✅ Approve</button>
                    <button style={styles.rejectBtn} onClick={() => handleReject(item._id)}>❌ Reject</button>
                  </div>
                )}

                {item.restaurantProvided && item.volunteerPickedUp && !item.adminCompleted && (
                  <button style={styles.completeBtn} onClick={() => handleComplete(item._id)}>
                    🎉 Mark Transaction as Completed
                  </button>
                )}

                {item.adminCompleted && (
                  <p style={styles.completedText}>🎉 Transaction Successfully Completed!</p>
                )}

                {item.adminApproved && !item.adminRejected && (
                  <p style={styles.approvedText}>✅ Approved</p>
                )}
                {item.adminRejected && (
                  <p style={styles.rejectedText}>❌ Rejected</p>
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
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { color: '#2e7d32', fontSize: '28px' },
  subtitle: { color: '#666', fontSize: '15px' },
  statsRow: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' },
  statBox: { backgroundColor: 'white', borderRadius: '12px', padding: '15px 25px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minWidth: '120px' },
  statNum: { fontSize: '28px', fontWeight: 'bold', color: '#2e7d32', margin: 0 },
  statLabel: { fontSize: '12px', color: '#888', margin: 0 },
  filterRow: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', border: '2px solid #2e7d32', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' },
  foodTitle: { color: '#1b5e20', fontSize: '18px', margin: 0 },
  badge: { color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  description: { color: '#555', fontSize: '14px', marginBottom: '10px' },
  details: { backgroundColor: '#f9fbe7', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#444', marginBottom: '15px', lineHeight: '1.8' },
  ackBox: { padding: '10px', borderRadius: '8px', marginBottom: '15px' },
  ackChecks: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '13px' },
  btnRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  approveBtn: { flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  rejectBtn: { flex: 1, padding: '10px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  completeBtn: { width: '100%', padding: '12px', backgroundColor: '#6a1b9a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  completedText: { color: '#2e7d32', fontWeight: 'bold', textAlign: 'center', fontSize: '15px' },
  approvedText: { color: '#2e7d32', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' },
  rejectedText: { color: '#c62828', fontWeight: 'bold', textAlign: 'center', fontSize: '13px' },
  message: { textAlign: 'center', padding: '10px', marginBottom: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', maxWidth: '400px', margin: '0 auto 20px' },
  empty: { textAlign: 'center', padding: '60px', color: '#666' },
  center: { textAlign: 'center', padding: '60px' },
};

export default AdminPanel;