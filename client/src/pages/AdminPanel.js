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
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchListings();
    const interval = setInterval(fetchListings, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend-pov2.onrender.com/api/food/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/admin/approve/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Listing approved!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/admin/reject/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('❌ Listing rejected!');
      fetchListings();
    } catch (err) { setMessage('❌ Something went wrong!'); }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/food/admin/complete/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('🎉 Transaction completed!');
      fetchListings();
    } catch (err) { setMessage('❌ ' + (err.response?.data?.message || 'Something went wrong!')); }
  };

  const getAckStatus = (item) => {
    if (item.status !== 'claimed' && item.status !== 'completed') return null;
    if (item.adminCompleted) return { text: '🎉 Transaction Completed', color: '#16A34A', bg: '#F0FDF4' };
    if (item.restaurantProvided && item.volunteerPickedUp)
      return { text: '🔔 Both acknowledged — Ready to Complete!', color: '#7C3AED', bg: '#FAF5FF' };
    if (item.restaurantProvided && !item.volunteerPickedUp)
      return { text: '⏳ Restaurant provided — waiting for volunteer', color: '#D97706', bg: '#FFFBEB' };
    if (!item.restaurantProvided && item.volunteerPickedUp)
      return { text: '⏳ Volunteer picked up — waiting for restaurant', color: '#D97706', bg: '#FFFBEB' };
    return { text: '⏳ Waiting for both to acknowledge', color: '#6B7280', bg: '#F9FAFB' };
  };

  const getStatusBadge = (item) => {
    if (item.status === 'completed') return { label: '🎉 Completed', color: '#16A34A', bg: '#F0FDF4' };
    if (item.adminRejected) return { label: '❌ Rejected', color: '#DC2626', bg: '#FEF2F2' };
    if (item.adminApproved && item.status === 'available') return { label: '✅ Live', color: '#16A34A', bg: '#F0FDF4' };
    if (item.adminApproved && item.status === 'claimed') return { label: '📦 Claimed', color: '#2563EB', bg: '#EFF6FF' };
    if (item.adminApproved && item.status === 'pending_payment') return { label: '💳 Pending Payment', color: '#7C3AED', bg: '#FAF5FF' };
    if (item.adminApproved && item.status === 'pending_restaurant_approval') return { label: '⏳ Awaiting Restaurant', color: '#D97706', bg: '#FFFBEB' };
    return { label: '⏳ Pending Review', color: '#D97706', bg: '#FFFBEB' };
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'action', label: '🔔 Action Needed' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const tabCounts = {
    all: listings.length,
    pending: listings.filter(i => !i.adminApproved && !i.adminRejected).length,
    approved: listings.filter(i => i.adminApproved && !i.adminRejected && i.status !== 'completed').length,
    action: listings.filter(i => i.restaurantProvided && i.volunteerPickedUp && !i.adminCompleted).length,
    completed: listings.filter(i => i.status === 'completed').length,
    rejected: listings.filter(i => i.adminRejected).length,
  };

  const filtered = listings.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.adminApproved && !item.adminRejected;
    if (filter === 'approved') return item.adminApproved && !item.adminRejected && item.status !== 'completed';
    if (filter === 'action') return item.restaurantProvided && item.volunteerPickedUp && !item.adminCompleted;
    if (filter === 'completed') return item.status === 'completed';
    if (filter === 'rejected') return item.adminRejected;
    return true;
  });

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading admin panel...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Admin Panel</h1>
            <p style={styles.sub}>Review listings, manage claims and complete transactions</p>
          </div>
          <div style={styles.adminBadge}>🛡️ Admin</div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📋</div>
            <span style={styles.statNum}>{listings.length}</span>
            <span style={styles.statLbl}>Total Listings</span>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <span style={styles.statNum}>{tabCounts.pending}</span>
            <span style={styles.statLbl}>Pending Review</span>
          </div>
          <div style={{
            ...styles.statCard,
            border: tabCounts.action > 0 ? '1px solid #EDE9FE' : '1px solid #F0F0F0',
            background: tabCounts.action > 0 ? '#FAF5FF' : 'white',
          }}>
            <div style={styles.statIcon}>🔔</div>
            <span style={{ ...styles.statNum, color: tabCounts.action > 0 ? '#7C3AED' : '#FF5200' }}>
              {tabCounts.action}
            </span>
            <span style={styles.statLbl}>Action Needed</span>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎉</div>
            <span style={styles.statNum}>{tabCounts.completed}</span>
            <span style={styles.statLbl}>Completed</span>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <span style={{ ...styles.statNum, color: tabCounts.rejected > 0 ? '#DC2626' : '#FF5200' }}>
              {tabCounts.rejected}
            </span>
            <span style={styles.statLbl}>Rejected</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsWrap}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(filter === tab.key ? styles.tabActive : {})
              }}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span style={{
                ...styles.tabCount,
                background: filter === tab.key ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                color: filter === tab.key ? 'white' : '#6B7280',
              }}>
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.msgBox,
            background: message.includes('✅') || message.includes('🎉') ? '#F0FDF4' : '#FEF2F2',
            borderColor: message.includes('✅') || message.includes('🎉') ? '#BBF7D0' : '#FECACA',
            color: message.includes('✅') || message.includes('🎉') ? '#16A34A' : '#DC2626',
          }}>
            {message}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>Nothing here</h3>
            <p style={styles.emptySub}>No listings match this filter</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(item => {
              const badge = getStatusBadge(item);
              const ack = getAckStatus(item);
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
                    <span style={styles.chip}>📦 {item.quantity}</span>
                    <span style={styles.chip}>{item.type === 'free' ? '🆓 Free' : `💰 ₹${item.price}`}</span>
                    <span style={styles.chip}>⏰ {new Date(item.expiryTime).toLocaleDateString()}</span>
                  </div>

                  {/* Listing ID */}
                  <div style={styles.idBox}>
                    <span style={styles.idLabel}>ID</span>
                    <span style={styles.idValue}>{item._id}</span>
                  </div>

                  {/* Restaurant Info */}
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>🏪</span>
                      <div style={styles.infoContent}>
                        <span style={styles.infoName}>{item.postedBy?.name}</span>
                        <span style={styles.infoSub}>{item.postedBy?.email}</span>
                      </div>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📍</span>
                      <span style={styles.infoSub}>{item.address}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📞</span>
                      <span style={styles.infoSub}>{item.phone}</span>
                    </div>
                    {item.claimedBy && (
                      <div style={{
                        ...styles.infoRow,
                        marginTop: '8px', paddingTop: '8px',
                        borderTop: '1px solid #F3F4F6'
                      }}>
                        <span style={styles.infoIcon}>👤</span>
                        <div style={styles.infoContent}>
                          <span style={styles.infoName}>{item.claimedBy?.name}</span>
                          <span style={styles.infoSub}>{item.claimedBy?.email}</span>
                          <span style={{
                            fontSize: '0.78rem', fontWeight: '600',
                            color: '#FF5200', marginTop: '2px'
                          }}>
                            Claimed: {item.claimedQuantity} {item.quantityUnit || 'plates'}
                            {item.type === 'paid' && ` @ ₹${item.pricePerUnit}/unit = ₹${item.price}`}
                          </span>
                        </div>
                        <span style={styles.claimedTag}>Claimed by</span>
                      </div>
                    )}
                  </div>

                  {/* Ack Status */}
                  {ack && (
                    <div style={{ ...styles.ackBox, background: ack.bg, borderColor: ack.color + '40' }}>
                      <div style={styles.ackRow}>
                        <span style={{ color: ack.color, fontSize: '0.82rem', fontWeight: '600' }}>
                          {ack.text}
                        </span>
                      </div>
                      {(item.status === 'claimed' || item.status === 'completed') && (
                        <div style={styles.ackChecks}>
                          <span style={{ color: item.restaurantProvided ? '#16A34A' : '#9CA3AF', fontSize: '0.75rem' }}>
                            {item.restaurantProvided ? '✅' : '○'} Restaurant provided
                          </span>
                          <span style={{ color: item.volunteerPickedUp ? '#16A34A' : '#9CA3AF', fontSize: '0.75rem' }}>
                            {item.volunteerPickedUp ? '✅' : '○'} Volunteer picked up
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!item.adminApproved && !item.adminRejected && (
                    <div style={styles.actionRow}>
                      <button style={styles.approveBtn} onClick={() => handleApprove(item._id)}>
                        ✅ Approve
                      </button>
                      <button style={styles.rejectBtn} onClick={() => handleReject(item._id)}>
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {item.restaurantProvided && item.volunteerPickedUp && !item.adminCompleted && (
                    <button style={styles.completeBtn} onClick={() => handleComplete(item._id)}>
                      🎉 Mark Transaction as Completed
                    </button>
                  )}

                  {item.adminCompleted && (
                    <div style={styles.completedTag}>🎉 Transaction Successfully Completed!</div>
                  )}

                  {item.adminApproved && !item.adminRejected && !item.adminCompleted && (
                    <div style={styles.approvedTag}>✅ Approved and Live</div>
                  )}
                  {item.adminRejected && (
                    <div style={styles.rejectedTag}>❌ Rejected</div>
                  )}
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
  wrap: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '64px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #F3F4F6', borderTop: '3px solid #FF5200', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9CA3AF', fontSize: '0.9rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { fontSize: '0.9rem', color: '#9CA3AF' },
  adminBadge: { padding: '8px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #1C1C1C, #2D2D2D)', color: 'white', fontSize: '0.85rem', fontWeight: '700' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '18px 16px', textAlign: 'center', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'transform 0.15s' },
  statIcon: { fontSize: '1.4rem', marginBottom: '8px', display: 'block' },
  statNum: { display: 'block', fontSize: '1.8rem', fontWeight: '800', color: '#FF5200', lineHeight: 1, marginBottom: '4px' },
  statLbl: { display: 'block', fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' },
  tabsWrap: { display: 'flex', gap: '5px', marginBottom: '20px', flexWrap: 'wrap', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #E5E7EB', width: 'fit-content' },
  tab: { padding: '8px 13px', borderRadius: '8px', border: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' },
  tabActive: { background: '#FF5200', color: 'white', boxShadow: '0 2px 8px rgba(255,82,0,0.25)' },
  tabCount: { fontSize: '0.68rem', fontWeight: '700', padding: '1px 7px', borderRadius: '20px' },
  msgBox: { padding: '12px 16px', borderRadius: '10px', border: '1px solid', fontSize: '0.88rem', fontWeight: '500', marginBottom: '20px' },
  empty: { background: 'white', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', border: '1px solid #F0F0F0' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '12px' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px' },
  emptySub: { fontSize: '0.88rem', color: '#9CA3AF' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' },
  foodTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1C1C1C', margin: 0, letterSpacing: '-0.01em' },
  statusBadge: { fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 },
  detailsBox: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  chip: { fontSize: '0.75rem', color: '#374151', background: '#F9FAFB', padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontWeight: '500' },
  idBox: { background: '#F9FAFB', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E5E7EB' },
  idLabel: { fontSize: '0.65rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 },
  idValue: { fontSize: '0.72rem', color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all' },
  infoBox: { background: '#F9FAFB', borderRadius: '10px', padding: '12px', border: '1px solid #E5E7EB' },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' },
  infoIcon: { fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' },
  infoContent: { display: 'flex', flexDirection: 'column', flex: 1 },
  infoName: { fontSize: '0.84rem', fontWeight: '600', color: '#1C1C1C' },
  infoSub: { fontSize: '0.74rem', color: '#9CA3AF' },
  claimedTag: { fontSize: '0.62rem', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 },
  ackBox: { padding: '10px 13px', borderRadius: '8px', border: '1px solid' },
  ackRow: { marginBottom: '6px' },
  ackChecks: { display: 'flex', flexDirection: 'column', gap: '3px' },
  actionRow: { display: 'flex', gap: '8px' },
  approveBtn: { flex: 1, padding: '10px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.84rem', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '10px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.84rem', fontWeight: '600', cursor: 'pointer' },
  completeBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' },
  completedTag: { textAlign: 'center', fontSize: '0.84rem', color: '#16A34A', fontWeight: '700', padding: '10px', background: '#F0FDF4', borderRadius: '8px' },
  approvedTag: { textAlign: 'center', fontSize: '0.8rem', color: '#16A34A', fontWeight: '600', padding: '8px', background: '#F0FDF4', borderRadius: '8px' },
  rejectedTag: { textAlign: 'center', fontSize: '0.8rem', color: '#DC2626', fontWeight: '600', padding: '8px', background: '#FEF2F2', borderRadius: '8px' },
};

export default AdminPanel;