import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchListings = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend-pov2.onrender.com/api/food');
      setListings(res.data);
      fetchRatings(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchRatings = async (listings) => {
    const ratings = {};
    for (const item of listings) {
      try {
        const res = await axios.get(
          `https://aharasetu-backend-pov2.onrender.com/api/ratings/average/${item.postedBy._id}`
        );
        ratings[item.postedBy._id] = res.data;
      } catch (err) {}
    }
    setRatings(ratings);
  };

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (item) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.put(
        `https://aharasetu-backend-pov2.onrender.com/api/food/claim/${item._id}`, {},
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

  const filtered = listings.filter(item => {
    const matchFilter = filter === 'all' || item.type === filter;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.postedBy?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const renderStars = (avg) => {
    if (!avg) return null;
    return '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
  };

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>Finding food near you...</p>
    </div>
  );

  return (
    <div style={styles.page}>

      {/* Hero Banner */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🌟 Making Food Waste History</div>
          <h1 style={styles.heroTitle}>
            Find surplus food,<br />
            <span style={styles.heroOrange}>help someone today</span>
          </h1>
          <p style={styles.heroSub}>
            Browse verified food listings from restaurants near you. Claim for free or at a reduced price.
          </p>
          <div style={styles.heroSearch}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search food or restaurant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>{listings.length}</span>
            <span style={styles.heroStatLbl}>Live Listings</span>
          </div>
          <div style={styles.heroStatDiv} />
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>{listings.filter(l => l.type === 'free').length}</span>
            <span style={styles.heroStatLbl}>Free Today</span>
          </div>
          <div style={styles.heroStatDiv} />
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>{listings.filter(l => l.type === 'paid').length}</span>
            <span style={styles.heroStatLbl}>Discounted</span>
          </div>
        </div>
      </div>

      <div style={styles.main}>

        {/* Filter Tabs */}
        <div style={styles.filterRow}>
          <div style={styles.filterTabs}>
            {[
              { key: 'all', label: '🍽️ All Listings' },
              { key: 'free', label: '🆓 Free Only' },
              { key: 'paid', label: '💰 Discounted' },
            ].map(f => (
              <button
                key={f.key}
                style={{
                  ...styles.filterTab,
                  ...(filter === f.key ? styles.filterTabActive : {})
                }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={styles.resultCount}>
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
          </span>
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
            <h3 style={styles.emptyTitle}>No listings found</h3>
            <p style={styles.emptySub}>
              {search ? 'Try a different search term' : 'Check back soon — new food is added daily!'}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(item => {
              const rating = ratings[item.postedBy?._id];
              return (
                <div key={item._id} style={styles.card}>

                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <span style={{
                      ...styles.typeBadge,
                      background: item.type === 'free'
                        ? 'linear-gradient(135deg, #16A34A, #22C55E)'
                        : 'linear-gradient(135deg, #FF5200, #FF8C00)',
                    }}>
                      {item.type === 'free' ? '🆓 Free' : `💰 ₹${item.price}`}
                    </span>
                    <span style={styles.expiryTag}>
                      ⏰ {new Date(item.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Food Info */}
                  <h3 style={styles.foodTitle}>{item.title}</h3>
                  {item.description && (
                    <p style={styles.foodDesc}>{item.description}</p>
                  )}

                  {/* Details */}
                  <div style={styles.detailRow}>
                    <span style={styles.detailItem}>📦 {item.quantity}</span>
                  </div>

                  {/* Divider */}
                  <div style={styles.cardDivider} />

                  {/* Restaurant Info */}
                  <div style={styles.restaurantInfo}>
                    <div style={styles.restaurantAvatar}>
                      {item.postedBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.restaurantDetails}>
                      <span style={styles.restaurantName}>{item.postedBy?.name}</span>
                      <span style={styles.restaurantAddr}>📍 {item.address}</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={styles.contactRow}>
                    <a href={`tel:${item.phone}`} style={styles.contactChip}>
                      📞 {item.phone}
                    </a>
                    <a href={`mailto:${item.contactEmail}`} style={styles.contactChip}>
                      ✉️ Email
                    </a>
                  </div>

                  {/* Rating */}
                  <div style={styles.ratingRow}>
                    {rating?.average ? (
                      <>
                        <StarRating value={parseFloat(rating.average)} readOnly size="14px" />
                        <span style={styles.ratingNum}>{rating.average}</span>
                        <span style={styles.ratingCount}>({rating.total})</span>
                      </>
                    ) : (
                      <span style={styles.noRating}>No ratings yet</span>
                    )}
                  </div>

                  {/* Claim Button */}
                  <button
                    style={{
                      ...styles.claimBtn,
                      background: item.type === 'free'
                        ? 'linear-gradient(135deg, #FF5200, #FF6B35)'
                        : 'linear-gradient(135deg, #1C1C1C, #2D2D2D)',
                    }}
                    onClick={() => handleClaim(item)}
                  >
                    {item.type === 'free' ? '🙏 Claim for Free' : `💳 Claim & Pay ₹${item.price}`}
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
  loadingPage: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '16px',
    paddingTop: '64px',
  },
  loadingSpinner: {
    width: '40px', height: '40px',
    border: '3px solid #F3F4F6',
    borderTop: '3px solid #FF5200',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: '#9CA3AF', fontSize: '0.95rem' },
  hero: {
    background: 'linear-gradient(145deg, #1C1C1C 0%, #2D2D2D 100%)',
    padding: '56px 32px 40px',
  },
  heroContent: { maxWidth: '680px', margin: '0 auto', textAlign: 'center' },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,82,0,0.15)',
    border: '1px solid rgba(255,82,0,0.3)',
    color: '#FF8C00', fontSize: '0.8rem', fontWeight: '600',
    padding: '5px 14px', borderRadius: '20px',
    marginBottom: '20px', letterSpacing: '0.04em',
  },
  heroTitle: {
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: '800', color: 'white',
    lineHeight: 1.2, marginBottom: '14px',
    letterSpacing: '-0.03em',
  },
  heroOrange: { color: '#FF5200' },
  heroSub: {
    fontSize: '1rem', color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7, marginBottom: '28px',
  },
  heroSearch: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'white', borderRadius: '12px',
    padding: '12px 18px', maxWidth: '480px', margin: '0 auto 32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  searchIcon: { fontSize: '1rem', flexShrink: 0 },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '0.95rem', color: '#1C1C1C',
    background: 'transparent',
  },
  heroStats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '32px', maxWidth: '400px', margin: '0 auto',
  },
  heroStat: { textAlign: 'center' },
  heroStatNum: {
    display: 'block', fontSize: '1.8rem', fontWeight: '800',
    color: '#FF5200', lineHeight: 1,
  },
  heroStatLbl: {
    display: 'block', fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.4)', marginTop: '4px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  heroStatDiv: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  filterRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '24px',
    flexWrap: 'wrap', gap: '12px',
  },
  filterTabs: {
    display: 'flex', gap: '6px',
    background: 'white', padding: '4px',
    borderRadius: '10px', border: '1px solid #E5E7EB',
  },
  filterTab: {
    padding: '8px 16px', borderRadius: '7px',
    border: 'none', background: 'transparent',
    fontSize: '0.85rem', fontWeight: '500',
    color: '#6B6B6B', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterTabActive: {
    background: '#FF5200', color: 'white',
    boxShadow: '0 2px 8px rgba(255,82,0,0.3)',
  },
  resultCount: { fontSize: '0.85rem', color: '#9CA3AF' },
  msgBox: {
    padding: '14px 18px', borderRadius: '10px',
    border: '1px solid', fontSize: '0.9rem',
    fontWeight: '500', marginBottom: '20px',
  },
  empty: {
    textAlign: 'center', padding: '80px 24px',
    background: 'white', borderRadius: '16px',
    border: '1px solid #F0F0F0',
  },
  emptyIcon: { fontSize: '3.5rem', marginBottom: '16px' },
  emptyTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' },
  emptySub: { fontSize: '0.9rem', color: '#9CA3AF' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'white', borderRadius: '16px',
    padding: '20px', border: '1px solid #F0F0F0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: {
    color: 'white', fontSize: '0.78rem', fontWeight: '700',
    padding: '5px 12px', borderRadius: '20px',
    letterSpacing: '0.02em',
  },
  expiryTag: {
    fontSize: '0.75rem', color: '#9CA3AF',
    background: '#F9FAFB', padding: '4px 10px',
    borderRadius: '20px', border: '1px solid #E5E7EB',
  },
  foodTitle: {
    fontSize: '1.1rem', fontWeight: '700',
    color: '#1C1C1C', letterSpacing: '-0.01em', margin: 0,
  },
  foodDesc: {
    fontSize: '0.85rem', color: '#6B6B6B',
    lineHeight: 1.5, margin: 0,
  },
  detailRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  detailItem: {
    fontSize: '0.8rem', color: '#6B6B6B',
    background: '#F9FAFB', padding: '4px 10px',
    borderRadius: '6px', border: '1px solid #E5E7EB',
  },
  cardDivider: { height: '1px', background: '#F3F4F6' },
  restaurantInfo: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  restaurantAvatar: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '0.9rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  restaurantDetails: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  restaurantName: { fontSize: '0.88rem', fontWeight: '600', color: '#1C1C1C' },
  restaurantAddr: { fontSize: '0.78rem', color: '#9CA3AF' },
  contactRow: { display: 'flex', gap: '8px' },
  contactChip: {
    flex: 1, padding: '7px 10px', borderRadius: '8px',
    background: '#F9FAFB', border: '1px solid #E5E7EB',
    fontSize: '0.75rem', color: '#374151', fontWeight: '500',
    textAlign: 'center', textDecoration: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
  },
  ratingRow: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 12px', background: '#FFFBEB',
    borderRadius: '8px', border: '1px solid #FDE68A',
  },
  ratingNum: { fontSize: '0.85rem', fontWeight: '700', color: '#F59E0B' },
  ratingCount: { fontSize: '0.78rem', color: '#9CA3AF' },
  noRating: { fontSize: '0.78rem', color: '#9CA3AF' },
  claimBtn: {
    width: '100%', padding: '13px',
    color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '0.92rem',
    fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255,82,0,0.25)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginTop: 'auto',
  },
};

export default Home;