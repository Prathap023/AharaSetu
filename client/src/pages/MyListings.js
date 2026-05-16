import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

function MyListings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [listingRatings, setListingRatings] = useState({
    data: {},
    average: null,
    total: 0
  });

useEffect(() => {
  if (!user || user.role !== "restaurant") {
    navigate("/login");
    return;
  }

  fetchListings();

  const interval = setInterval(() => {
    fetchListings();
  }, 5000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (listings && listings.length > 0) {
    listings.forEach((listing) => {
      fetchAllRatings(listing._id || listing.id);
    });
  }
}, [listings]);

  const fetchListings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/food/my-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

const fetchAllRatings = async (listingId) => {
  if (!listingId) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/ratings/restaurant/${listingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API response:", res.data);

    const firstRating =
      res.data.ratings && res.data.ratings.length > 0
        ? res.data.ratings[0]
        : null;

    setListingRatings((prev) => ({
      ...prev,

      data: {
        ...prev.data,

        [listingId]: firstRating
          ? {
              stars: firstRating.stars,
              comment: firstRating.comment,
              volunteer: firstRating.volunteer,
            }
          : null,
      },

      average: res.data.average,
      total: res.data.total,
    }));

  } catch (err) {
    console.error("fetchAllRatings error:", err);
  }
};
  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/food/approve-claim/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Claim approved!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/food/reject-claim/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Claim rejected and payment refunded!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleProvided = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/food/restaurant-provided/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Marked as provided!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const getAcknowledgementStatus = (item) => {
    if (item.status !== 'claimed' && item.status !== 'completed') return null;
    if (item.adminCompleted) return { text: '🎉 Transaction Completed!', color: '#2e7d32' };
    if (item.restaurantProvided && !item.volunteerPickedUp)
      return { text: '✅ You provided — waiting for volunteer to pick up', color: '#f57f17' };
    if (!item.restaurantProvided && item.volunteerPickedUp)
      return { text: '⚠️ Volunteer picked up — please acknowledge you provided!', color: '#c62828' };
    if (item.restaurantProvided && item.volunteerPickedUp)
      return { text: '✅ Both acknowledged — waiting for admin to complete', color: '#1565c0' };
    return { text: '⏳ Waiting for both acknowledgements', color: '#666' };
  };

  const getStatusBadge = (item) => {
    if (!item.adminApproved && !item.adminRejected) return { text: '⏳ Pending Admin Approval', color: '#f57f17' };
    if (item.adminRejected) return { text: '❌ Rejected by Admin', color: '#c62828' };
    if (item.status === 'completed') return { text: '🎉 Completed', color: '#2e7d32' };
    if (item.status === 'available') return { text: '✅ Live', color: '#2e7d32' };
    if (item.status === 'pending_payment') return { text: '💳 Waiting for Payment', color: '#1565c0' };
    if (item.status === 'pending_restaurant_approval') return { text: '🔔 Action Required!', color: '#6a1b9a' };
    if (item.status === 'claimed') return { text: '📦 Claimed', color: '#1565c0' };
    return { text: item.status, color: '#666' };
  };

  if (loading) return <div style={styles.center}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏪 My Food Listings</h2>
        <p style={styles.subtitle}>Manage your posted food and approve claims</p>
      </div>

      {/* Overall Rating Summary */}
      {listingRatings.average && (
        <div style={styles.overallRating}>
          <p style={styles.overallTitle}>⭐ Your Overall Restaurant Rating</p>
          <div style={styles.overallRow}>
            <StarRating
              value={parseFloat(listingRatings.average)}
              readOnly
              size="24px"
            />
            <span style={styles.overallNum}>{listingRatings.average}</span>
            <span style={styles.overallCount}>
              from {listingRatings.total} {listingRatings.total === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      )}

      {message && <p style={styles.message}>{message}</p>}

      {listings.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't posted any food yet.</p>
          <button style={styles.btn} onClick={() => navigate('/dashboard')}>
            Post Food Now
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {[...listings]
            .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
            .map(item => {
              const badge = getStatusBadge(item);
              const ackStatus = getAcknowledgementStatus(item);
              const itemRating = listingRatings.data?.[item._id];

              return (
                <div key={item._id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <h3 style={styles.foodTitle}>{item.title}</h3>
                    <span style={{ ...styles.badge, backgroundColor: badge.color }}>
                      {badge.text}
                    </span>
                  </div>

                  <div style={styles.details}>
                    <p>📦 Quantity: {item.quantity}</p>
                    <p>🆔 Listing ID: <span style={styles.idTag}>{item._id}</span></p>
                    <p>💰 Type: {item.type === 'free' ? 'Free' : `Paid - ₹${item.price}`}</p>
                    <p>⏰ Expires: {new Date(item.expiryTime).toLocaleString()}</p>
                    <p>📍 Address: {item.address}</p>
                  </div>

                  {item.claimedBy && (
                    <div style={styles.claimerBox}>
                      <p style={styles.claimerTitle}>👤 Claimed By:</p>
                      <p>Name: {item.claimedBy.name}</p>
                      <p>Email: {item.claimedBy.email}</p>
                      <p>Phone: {item.claimedBy.phone || 'Not provided'}</p>
                    </div>
                  )}

                  {item.status === 'pending_restaurant_approval' && (
                    <div style={styles.btnRow}>
                      <button style={styles.approveBtn} onClick={() => handleApprove(item._id)}>
                        ✅ Approve Claim
                      </button>
                      <button style={styles.rejectBtn} onClick={() => handleReject(item._id)}>
                        ❌ Reject & Refund
                      </button>
                    </div>
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

                  {item.status === 'claimed' && !item.restaurantProvided && (
                    <button style={styles.providedBtn} onClick={() => handleProvided(item._id)}>
                      ✅ I Have Provided the Food
                    </button>
                  )}

                  {item.status === 'claimed' && item.restaurantProvided && (
                    <p style={styles.doneText}>✅ You have acknowledged providing the food</p>
                  )}

                  {/* Individual Rating per listing */}
                  {item.status === 'completed' && itemRating && (
                    <div style={styles.ratingReceived}>
                      <p style={styles.ratingReceivedTitle}>⭐ Rating Received for this Listing</p>
                      <StarRating value={itemRating?.stars} readOnly size="20px" />
                      <p style={styles.ratingFrom}>by {itemRating.volunteer?.name}</p>
                      {itemRating.comment && (
                        <p style={styles.ratingComment}>"{itemRating.comment}"</p>
                      )}
                    </div>
                  )}

                  {item.status === 'completed' && !itemRating && (
                    <div style={styles.noRatingYet}>
                      <p>⏳ No rating received yet for this listing</p>
                    </div>
                  )}

                  <button
                    style={styles.reportBtn}
                    onClick={() => navigate('/report', {
                      state: { listingId: item._id, title: item.title }
                    })}
                  >
                    🚨 Report Issue
                  </button>
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
  details: { backgroundColor: '#f9fbe7', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#444', marginBottom: '15px', lineHeight: '1.8' },
  idTag: { fontFamily: 'monospace', backgroundColor: '#e8f5e9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' },
  claimerBox: { backgroundColor: '#e8eaf6', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#333', marginBottom: '15px', lineHeight: '1.8' },
  claimerTitle: { fontWeight: 'bold', marginBottom: '5px', color: '#1a237e' },
  btnRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  approveBtn: { flex: 1, padding: '10px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  rejectBtn: { flex: 1, padding: '10px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  providedBtn: { width: '100%', padding: '10px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '10px' },
  ackBox: { padding: '10px', borderRadius: '8px', marginTop: '10px', marginBottom: '10px' },
  doneText: { color: '#2e7d32', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' },
  message: { textAlign: 'center', padding: '10px', marginBottom: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', maxWidth: '400px', margin: '0 auto 20px' },
  empty: { textAlign: 'center', padding: '60px', color: '#666' },
  center: { textAlign: 'center', padding: '60px' },
  btn: { padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' },
  reportBtn: { width: '100%', padding: '10px', backgroundColor: '#fff3e0', color: '#e65100', border: '2px solid #e65100', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '10px', fontWeight: 'bold' },
  overallRating: { backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' },
  overallTitle: { fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' },
  overallRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  overallNum: { fontSize: '22px', fontWeight: '700', color: '#f59e0b' },
  overallCount: { fontSize: '13px', color: '#9ca3af' },
  ratingReceived: { marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' },
  ratingReceivedTitle: { fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '8px' },
  ratingFrom: { fontSize: '12px', color: '#6b7280', margin: '6px 0 0', fontStyle: 'italic' },
  ratingComment: { fontSize: '13px', color: '#374151', fontStyle: 'italic', marginTop: '6px', padding: '6px', background: 'white', borderRadius: '6px' },
  noRatingYet: { marginTop: '10px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', color: '#9ca3af', textAlign: 'center' },
};

export default MyListings;