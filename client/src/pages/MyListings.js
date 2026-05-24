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
  const [listingRatings, setListingRatings] = useState({ data: {}, average: null, total: 0 });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'restaurant') { navigate('/login'); return; }
    fetchListings();
    fetchAllRatings();
    const interval = setInterval(() => { fetchListings(); fetchAllRatings(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend-pov2.onrender.com/api/food/my-listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchAllRatings = async () => {
    try {
      const userId = user._id || user.id;
      const res = await axios.get(
        `https://aharasetu-backend-pov2.onrender.com/api/ratings/restaurant/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = {};
      res.data.ratings.forEach(r => {
        if (r.foodListing?._id) data[r.foodListing._id] = r;
      });
      setListingRatings({ data, average: res.data.average, total: res.data.total });
    } catch (err) { console.error(err); }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/approve-claim/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Claim approved!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/reject-claim/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Claim rejected and payment refunded!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleProvided = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/restaurant-provided/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Marked as provided!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const getAckStatus = (item) => {
    if (item.status !== 'claimed' && item.status !== 'completed') return null;
    if (item.adminCompleted) return { text: '🎉 Transaction Completed!', color: '#16A34A', bg: '#F0FDF4' };
    if (item.restaurantProvided && !item.volunteerPickedUp)
      return { text: '✅ You provided — waiting for volunteer to pick up', color: '#D97706', bg: '#FFFBEB' };
    if (!item.restaurantProvided && item.volunteerPickedUp)
      return { text: '⚠️ Volunteer picked up — please acknowledge!', color: '#DC2626', bg: '#FEF2F2' };
    if (item.restaurantProvided && item.volunteerPickedUp)
      return { text: '✅ Both acknowledged — waiting for admin', color: '#2563EB', bg: '#EFF6FF' };
    return { text: '⏳ Waiting for acknowledgements', color: '#6B7280', bg: '#F9FAFB' };
  };

  const getStatusBadge = (item) => {
    if (!item.adminApproved && !item.adminRejected) return { label: '⏳ Pending Review', color: '#D97706', bg: '#FFFBEB' };
    if (item.adminRejected) return { label: '❌ Rejected', color: '#DC2626', bg: '#FEF2F2' };
    if (item.status === 'completed') return { label: '🎉 Completed', color: '#16A34A', bg: '#F0FDF4' };
    if (item.status === 'available') return { label: '✅ Live', color: '#16A34A', bg: '#F0FDF4' };
    if (item.status === 'pending_payment') return { label: '💳 Awaiting Payment', color: '#7C3AED', bg: '#FAF5FF' };
    if (item.status === 'pending_restaurant_approval') return { label: '🔔 Action Required', color: '#DC2626', bg: '#FEF2F2' };
    if (item.status === 'claimed') return { label: '📦 Claimed', color: '#2563EB', bg: '#EFF6FF' };
    return { label: item.status, color: '#6B7280', bg: '#F9FAFB' };
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Live' },
    { key: 'pending_restaurant_approval', label: 'Action Needed' },
    { key: 'claimed', label: 'Claimed' },
    { key: 'completed', label: 'Completed' },
  ];

  const filtered = activeTab === 'all'
    ? listings
    : listings.filter(l => l.status === activeTab);

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading your listings...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Listings</h1>
            <p style={styles.sub}>Manage your food listings and approve claims</p>
          </div>
          <button style={styles.postBtn} onClick={() => navigate('/dashboard')}>
            + Post New Food
          </button>
        </div>

        {/* Overall Rating Banner */}
        {listingRatings.average && (
          <div style={styles.ratingBanner}>
            <div style={styles.ratingBannerLeft}>
              <span style={styles.ratingBannerIcon}>⭐</span>
              <div>
                <p style={styles.ratingBannerTitle}>Your Restaurant Rating</p>
                <p style={styles.ratingBannerSub}>Based on {listingRatings.total} completed transactions</p>
              </div>
            </div>
            <div style={styles.ratingBannerRight}>
              <span style={styles.ratingBannerNum}>{listingRatings.average}</span>
              <StarRating value={parseFloat(listingRatings.average)} readOnly size="20px" />
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{listings.length}</span>
            <span style={styles.statLbl}>Total Posted</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{listings.filter(l => l.status === 'available').length}</span>
            <span style={styles.statLbl}>Live Now</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{listings.filter(l => l.status === 'pending_restaurant_approval').length}</span>
            <span style={{ ...styles.statLbl, color: listings.filter(l => l.status === 'pending_restaurant_approval').length > 0 ? '#DC2626' : '#9CA3AF' }}>
              Action Needed
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{listings.filter(l => l.status === 'completed').length}</span>
            <span style={styles.statLbl}>Completed</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsWrap}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(activeTab === tab.key ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span style={{
                  ...styles.tabCount,
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#F3F4F6',
                  color: activeTab === tab.key ? 'white' : '#6B7280',
                }}>
                  {tab.key === 'available'
                    ? listings.filter(l => l.status === 'available').length
                    : tab.key === 'pending_restaurant_approval'
                    ? listings.filter(l => l.status === 'pending_restaurant_approval').length
                    : tab.key === 'claimed'
                    ? listings.filter(l => l.status === 'claimed').length
                    : listings.filter(l => l.status === 'completed').length}
                </span>
              )}
            </button>
          ))}
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🍽️</div>
            <h3 style={styles.emptyTitle}>No listings here</h3>
            <p style={styles.emptySub}>
              {activeTab === 'all' ? 'Post your first food listing!' : `No ${activeTab} listings`}
            </p>
            {activeTab === 'all' && (
              <button style={styles.emptyBtn} onClick={() => navigate('/dashboard')}>
                Post Food Now →
              </button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {[...filtered]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(item => {
                const badge = getStatusBadge(item);
                const ack = getAckStatus(item);
                const itemRating = listingRatings.data?.[item._id];

                return (
                  <div key={item._id} style={styles.card}>

                    {/* Card Top */}
                    <div style={styles.cardTop}>
                      <h3 style={styles.foodTitle}>{item.title}</h3>
                      <span style={{ ...styles.statusBadge, color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={styles.detailsBox}>
                      <span style={styles.detailChip}>📦 {item.quantity}</span>
                      <span style={styles.detailChip}>
                        {item.type === 'free' ? '🆓 Free' :  `💰 ₹${item.price}`}
                      </span>
                      <span style={styles.detailChip}>
                        ⏰ {new Date(item.expiryTime).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Listing ID */}
                    <div style={styles.idBox}>
                      <span style={styles.idLabel}>Listing ID</span>
                      <span style={styles.idValue}>{item._id}</span>
                    </div>

                    {/* Claimer Info */}
                    {item.claimedBy && (
                      <div style={styles.claimerBox}>
                        <span style={styles.claimerTag}>Claimed by</span>
                        <div style={styles.claimerAvatar}>
                          {item.claimedBy.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.claimerInfo}>
                          <span style={styles.claimerName}>{item.claimedBy.name}</span>
                          <span style={styles.claimerEmail}>{item.claimedBy.email}</span>
                          {item.claimedBy.phone && (
                            <span style={styles.claimerEmail}>{item.claimedBy.phone}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Approve/Reject */}
                    {item.status === 'pending_restaurant_approval' && (
                      <div style={styles.actionRow}>
                        <button style={styles.approveBtn} onClick={() => handleApprove(item._id)}>
                          ✅ Approve
                        </button>
                        <button style={styles.rejectBtn} onClick={() => handleReject(item._id)}>
                          ❌ Reject & Refund
                        </button>
                      </div>
                    )}

                    {/* Ack Status */}
                    {ack && (
                      <div style={{ ...styles.ackBox, background: ack.bg, borderColor: ack.color + '40' }}>
                        <span style={{ color: ack.color, fontSize: '0.82rem', fontWeight: '600' }}>
                          {ack.text}
                        </span>
                      </div>
                    )}

                    {/* Provided Button */}
                    {item.status === 'claimed' && !item.restaurantProvided && (
                      <button style={styles.providedBtn} onClick={() => handleProvided(item._id)}>
                        ✅ I Have Provided the Food
                      </button>
                    )}

                    {item.status === 'claimed' && item.restaurantProvided && (
                      <div style={styles.doneTag}>✅ You acknowledged providing the food</div>
                    )}

                    {/* Rating Received */}
                    {item.status === 'completed' && itemRating && (
                      <div style={styles.ratingBox}>
                        <p style={styles.ratingBoxTitle}>⭐ Rating Received</p>
                        <div style={styles.ratingBoxRow}>
                          <StarRating value={itemRating.stars} readOnly size="16px" />
                          <span style={styles.ratingBy}>by {itemRating.volunteer?.name}</span>
                        </div>
                        {itemRating.comment && (
                          <p style={styles.ratingComment}>"{itemRating.comment}"</p>
                        )}
                        {console.log(itemRating)}
                      </div>
                    )}

                    {item.status === 'completed' && !itemRating && (
                      <div style={styles.noRatingBox}>
                        ⏳ No rating received yet
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
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '64px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #F3F4F6', borderTop: '3px solid #FF5200', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9CA3AF', fontSize: '0.9rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { fontSize: '0.9rem', color: '#9CA3AF' },
  postBtn: { padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(255,82,0,0.25)' },
  ratingBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #1C1C1C, #2D2D2D)', borderRadius: '14px', padding: '18px 22px', marginBottom: '20px', gap: '16px' },
  ratingBannerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  ratingBannerIcon: { fontSize: '1.5rem' },
  ratingBannerTitle: { fontSize: '0.92rem', fontWeight: '700', color: 'white', marginBottom: '2px' },
  ratingBannerSub: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' },
  ratingBannerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  ratingBannerNum: { fontSize: '2rem', fontWeight: '800', color: '#FF5200' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  statNum: { display: 'block', fontSize: '1.6rem', fontWeight: '800', color: '#FF5200', lineHeight: 1 },
  statLbl: { display: 'block', fontSize: '0.72rem', color: '#9CA3AF', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  tabsWrap: { display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #E5E7EB', width: 'fit-content' },
  tab: { padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '0.84rem', fontWeight: '500', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' },
  tabActive: { background: '#FF5200', color: 'white', boxShadow: '0 2px 8px rgba(255,82,0,0.25)' },
  tabCount: { fontSize: '0.7rem', fontWeight: '700', padding: '1px 7px', borderRadius: '20px' },
  msgBox: { padding: '13px 16px', borderRadius: '10px', border: '1px solid', fontSize: '0.88rem', fontWeight: '500', marginBottom: '20px' },
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
  detailsBox: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  detailChip: { fontSize: '0.76rem', color: '#374151', background: '#F9FAFB', padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontWeight: '500' },
  idBox: { background: '#F9FAFB', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E5E7EB' },
  idLabel: { fontSize: '0.7rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 },
  idValue: { fontSize: '0.72rem', color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' },
  claimerBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#EFF6FF', borderRadius: '10px', padding: '10px 12px', border: '1px solid #BFDBFE' },
  claimerAvatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: 'white', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  claimerInfo: { display: 'flex', flexDirection: 'column', flex: 1, gap: '1px' },
  claimerName: { fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C' },
  claimerEmail: { fontSize: '0.72rem', color: '#6B7280' },
  claimerTag: { fontSize: '0.65rem', fontWeight: '700', color: '#2563EB', background: 'white', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 },
  actionRow: { display: 'flex', gap: '8px' },
  approveBtn: { flex: 1, padding: '10px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.84rem', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '10px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.84rem', fontWeight: '600', cursor: 'pointer' },
  ackBox: { padding: '10px 13px', borderRadius: '8px', border: '1px solid' },
  providedBtn: { width: '100%', padding: '11px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' },
  doneTag: { textAlign: 'center', fontSize: '0.82rem', color: '#16A34A', fontWeight: '600', padding: '8px', background: '#F0FDF4', borderRadius: '8px' },
  ratingBox: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px' },
  ratingBoxTitle: { fontSize: '0.75rem', fontWeight: '700', color: '#92400E', marginBottom: '8px' },
  ratingBoxRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  ratingBy: { fontSize: '0.75rem', color: '#9CA3AF' },
  ratingComment: { fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic', background: 'white', padding: '6px 10px', borderRadius: '6px', margin: 0 },
  noRatingBox: { textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', padding: '10px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' },
  reportBtn: { width: '100%', padding: '9px', background: 'transparent', border: '1px solid #FEE2E2', color: '#EF4444', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
};

export default MyListings;