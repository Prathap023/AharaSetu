import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RatingModal from '../components/RatingModal';
import StarRating from '../components/StarRating';

function MyClaims() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [myRatings, setMyRatings] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchClaims();
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend-pov2.onrender.com/api/food/my-claims', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(
  res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
);
      fetchMyRatings(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchMyRatings = async (claims) => {
    const ratings = {};
    for (const claim of claims) {
      if (claim.status === 'completed') {
        try {
          const res = await axios.get(
            `https://aharasetu-backend-pov2.onrender.com/api/ratings/my-rating/${claim._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data) ratings[claim._id] = res.data;
        } catch (err) {}
      }
    }
    setMyRatings(ratings);
  };

  const handlePickedUp = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/volunteer-pickedup/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Marked as picked up!');
      fetchClaims();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const getAckStatus = (item) => {
    if (item.status !== 'claimed' && item.status !== 'completed') return null;
    if (item.adminCompleted) return { text: '🎉 Transaction Completed!', color: '#16A34A', bg: '#F0FDF4' };
    if (item.volunteerPickedUp && !item.restaurantProvided)
      return { text: '✅ You picked up — waiting for restaurant to acknowledge', color: '#D97706', bg: '#FFFBEB' };
    if (!item.volunteerPickedUp && item.restaurantProvided)
      return { text: '⚠️ Restaurant provided — please acknowledge pickup!', color: '#DC2626', bg: '#FEF2F2' };
    if (item.restaurantProvided && item.volunteerPickedUp)
      return { text: '✅ Both acknowledged — waiting for admin to complete', color: '#2563EB', bg: '#EFF6FF' };
    return { text: '⏳ Waiting for both acknowledgements', color: '#6B7280', bg: '#F9FAFB' };
  };

  const getStatusInfo = (item) => {
    if (item.status === 'completed') return { label: '🎉 Completed', color: '#16A34A', bg: '#F0FDF4' };
    if (item.status === 'pending_payment') return { label: '💳 Payment Required', color: '#D97706', bg: '#FFFBEB' };
    if (item.status === 'pending_restaurant_approval') return { label: '⏳ Awaiting Approval', color: '#9333EA', bg: '#FAF5FF' };
    if (item.status === 'claimed') return { label: '📦 Claimed', color: '#2563EB', bg: '#EFF6FF' };
    if (item.restaurantRejected) return { label: '❌ Rejected & Refunded', color: '#DC2626', bg: '#FEF2F2' };
    return { label: item.status, color: '#6B7280', bg: '#F9FAFB' };
  };

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading your claims...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Claims</h1>
            <p style={styles.sub}>Track food you've claimed and your pickup status</p>
          </div>
          <button style={styles.browseBtn} onClick={() => navigate('/')}>
            🍱 Browse More Food
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.msgBox,
            background: message.includes('✅') ? '#F0FDF4' : '#FEF2F2',
            borderColor: message.includes('✅') ? '#BBF7D0' : '#FECACA',
            color: message.includes('✅') ? '#16A34A' : '#DC2626',
          }}>
            {message}
          </div>
        )}

        {/* Stats */}
        {claims.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{claims.length}</span>
              <span style={styles.statLbl}>Total Claims</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{claims.filter(c => c.status === 'completed').length}</span>
              <span style={styles.statLbl}>Completed</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{claims.filter(c => c.status === 'claimed').length}</span>
              <span style={styles.statLbl}>In Progress</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statNum}>{Object.keys(myRatings).length}</span>
              <span style={styles.statLbl}>Rated</span>
            </div>
          </div>
        )}

        {/* Claims List */}
        {claims.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={styles.emptyTitle}>No claims yet</h3>
            <p style={styles.emptySub}>Browse available food listings and make your first claim!</p>
            <button style={styles.emptyBtn} onClick={() => navigate('/')}>
              Browse Food →
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {claims.map(item => {
              const status = getStatusInfo(item);
              const ack = getAckStatus(item);
              const myRating = myRatings[item._id];

              return (
                <div key={item._id} style={styles.card}>

                  {/* Card Top */}
                  <div style={styles.cardTop}>
                    <h3 style={styles.foodTitle}>{item.title}</h3>
                    <span style={{ ...styles.statusBadge, color: status.color, background: status.bg }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={styles.detailsBox}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>📦</span>
                      <span style={styles.detailText}>{item.quantity}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>💰</span>
                      <span style={styles.detailText}>{item.type === 'free' ? 'Free' : `₹${item.price}`}</span>
                    </div>
                    {item.paymentDone && (
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>✅</span>
                        <span style={styles.detailText}>Payment confirmed</span>
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div style={styles.restaurantBox}>
                    <div style={styles.restaurantAvatar}>
                      {item.postedBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.restaurantInfo}>
                      <span style={styles.restaurantName}>{item.postedBy?.name}</span>
                      <span style={styles.restaurantContact}>📞 {item.postedBy?.phone || 'N/A'}</span>
                      <span style={styles.restaurantContact}>📍 {item.address}</span>
                    </div>
                    <div style={styles.contactBtns}>
                      <a href={`tel:${item.postedBy?.phone}`} style={styles.contactBtn}>📞</a>
                      <a href={`mailto:${item.postedBy?.email}`} style={styles.contactBtn}>✉️</a>
                    </div>
                  </div>

                  {/* Payment Button */}
                  {item.status === 'pending_payment' && (
                    <button style={styles.payBtn} onClick={() => navigate(`/payment/${item._id}`)}>
                      💳 Pay Now — ₹{item.price}
                    </button>
                  )}

                  {/* Acknowledgement Status */}
                  {ack && (
                    <div style={{ ...styles.ackBox, background: ack.bg, borderColor: ack.color + '40' }}>
                      <span style={{ color: ack.color, fontSize: '0.83rem', fontWeight: '600' }}>
                        {ack.text}
                      </span>
                    </div>
                  )}

                  {/* Pickup Button */}
                  {item.status === 'claimed' && !item.volunteerPickedUp && (
                    <button style={styles.pickupBtn} onClick={() => handlePickedUp(item._id)}>
                      ✅ I Have Picked Up the Food
                    </button>
                  )}

                  {item.status === 'claimed' && item.volunteerPickedUp && (
                    <div style={styles.doneTag}>✅ You acknowledged pickup</div>
                  )}

                  {/* Rating Section */}
                  {item.status === 'completed' && (
                    <div style={styles.ratingSection}>
                      {myRating ? (
                        <div style={styles.ratingDone}>
                          <div style={styles.ratingDoneTop}>
                            <StarRating value={myRating.stars} readOnly size="16px" />
                            <span style={styles.ratingDoneLabel}>Your rating</span>
                          </div>
                          {myRating.comment && (
                            <p style={styles.ratingComment}>"{myRating.comment}"</p>
                          )}
                          <button style={styles.editRatingBtn} onClick={() => setRatingModal(item)}>
                            ✏️ Edit Rating
                          </button>
                        </div>
                      ) : (
                        <button style={styles.rateBtn} onClick={() => setRatingModal(item)}>
                          ⭐ Rate this Restaurant
                        </button>
                      )}
                    </div>
                  )}

                  {/* Report */}
                  <button
                    style={styles.reportBtn}
                    onClick={() => navigate('/report', { state: { listingId: item._id, title: item.title } })}
                  >
                    🚨 Report Issue
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          listing={ratingModal}
          onClose={() => setRatingModal(null)}
          onSaved={() => { fetchClaims(); setRatingModal(null); }}
        />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '64px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #F3F4F6', borderTop: '3px solid #FF5200', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9CA3AF', fontSize: '0.9rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { fontSize: '0.9rem', color: '#9CA3AF' },
  browseBtn: { padding: '9px 18px', borderRadius: '9px', background: 'white', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', fontWeight: '600', color: '#374151', cursor: 'pointer', flexShrink: 0 },
  msgBox: { padding: '13px 16px', borderRadius: '10px', border: '1px solid', fontSize: '0.88rem', fontWeight: '500', marginBottom: '20px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '28px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  statNum: { display: 'block', fontSize: '1.6rem', fontWeight: '800', color: '#FF5200', lineHeight: 1 },
  statLbl: { display: 'block', fontSize: '0.72rem', color: '#9CA3AF', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  empty: { background: 'white', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: '1px solid #F0F0F0' },
  emptyIcon: { fontSize: '3rem', marginBottom: '14px' },
  emptyTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px' },
  emptySub: { fontSize: '0.88rem', color: '#9CA3AF', marginBottom: '20px' },
  emptyBtn: { padding: '11px 24px', borderRadius: '10px', background: '#FF5200', color: 'white', border: 'none', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' },
  foodTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1C1C1C', margin: 0, letterSpacing: '-0.01em' },
  statusBadge: { fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 },
  detailsBox: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '5px', background: '#F9FAFB', padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB' },
  detailIcon: { fontSize: '0.8rem' },
  detailText: { fontSize: '0.78rem', color: '#374151', fontWeight: '500' },
  restaurantBox: { display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F9FAFB', borderRadius: '10px', padding: '12px' },
  restaurantAvatar: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF5200, #FF8C00)', color: 'white', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  restaurantInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  restaurantName: { fontSize: '0.88rem', fontWeight: '600', color: '#1C1C1C' },
  restaurantContact: { fontSize: '0.75rem', color: '#9CA3AF' },
  contactBtns: { display: 'flex', gap: '6px' },
  contactBtn: { width: '30px', height: '30px', borderRadius: '8px', background: 'white', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', textDecoration: 'none' },
  payBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
  ackBox: { padding: '10px 13px', borderRadius: '8px', border: '1px solid' },
  pickupBtn: { width: '100%', padding: '11px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' },
  doneTag: { textAlign: 'center', fontSize: '0.82rem', color: '#16A34A', fontWeight: '600', padding: '8px', background: '#F0FDF4', borderRadius: '8px' },
  ratingSection: { borderTop: '1px solid #F3F4F6', paddingTop: '12px' },
  rateBtn: { width: '100%', padding: '11px', background: '#FFFBEB', border: '1.5px solid #FDE68A', color: '#D97706', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' },
  ratingDone: { display: 'flex', flexDirection: 'column', gap: '6px' },
  ratingDoneTop: { display: 'flex', alignItems: 'center', gap: '8px' },
  ratingDoneLabel: { fontSize: '0.75rem', color: '#9CA3AF' },
  ratingComment: { fontSize: '0.82rem', color: '#6B7280', fontStyle: 'italic', background: '#F9FAFB', padding: '8px 10px', borderRadius: '6px', margin: 0 },
  editRatingBtn: { alignSelf: 'flex-start', padding: '5px 12px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '0.75rem', color: '#374151', cursor: 'pointer', fontWeight: '500' },
  reportBtn: { width: '100%', padding: '9px', background: 'transparent', border: '1px solid #FEE2E2', color: '#EF4444', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' },
};

export default MyClaims;