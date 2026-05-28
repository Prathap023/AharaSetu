import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

const API = 'https://aharasetu-backend-pov2.onrender.com';

function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Admin redirect
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin');
  }, [user]);

  if (!user) return <LandingPage navigate={navigate} />;
  if (user.role === 'restaurant') return <RestaurantHome user={user} navigate={navigate} />;
  return <FoodBrowsePage user={user} token={token} navigate={navigate} />;
}

// ─────────────────────────────────────────────
// 1. LANDING PAGE (not logged in)
// ─────────────────────────────────────────────
function LandingPage({ navigate }) {
  return (
    <div style={lp.page}>

      {/* Hero */}
      <div style={lp.hero}>
        <div style={lp.heroInner}>
          <div style={lp.heroBadge}>Food Bridge Platform</div>
          <h1 style={lp.heroTitle}>
            Connecting surplus food<br />
            <span style={lp.heroOrange}>with people in need</span>
          </h1>
          <p style={lp.heroSub}>
            AharaSetu bridges the gap between restaurants with surplus food and communities that need it most — through a transparent, accountable platform.
          </p>
          <div style={lp.heroBtns}>
            <button style={lp.primaryBtn} onClick={() => navigate('/register')}>
              Get Started Free
            </button>
            <button style={lp.secondaryBtn} onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={lp.statsBar}>
        {[
          { val: '500+', lbl: 'Meals Saved' },
          { val: '50+', lbl: 'Restaurants' },
          { val: '200+', lbl: 'Volunteers' },
          { val: '10+', lbl: 'NGOs' },
        ].map((s, i) => (
          <div key={i} style={lp.statItem}>
            <span style={lp.statVal}>{s.val}</span>
            <span style={lp.statLbl}>{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={lp.section}>
        <div style={lp.sectionInner}>
          <p style={lp.sectionTag}>How it works</p>
          <h2 style={lp.sectionTitle}>Simple. Transparent. Impactful.</h2>
          <div style={lp.stepsGrid}>
            {[
              { num: '01', title: 'Restaurant Posts', desc: 'Restaurants list surplus food — free or at a reduced price.' },
              { num: '02', title: 'Admin Reviews', desc: 'Every listing is reviewed before going live to ensure quality.' },
              { num: '03', title: 'Volunteer Claims', desc: 'Volunteers and NGOs claim food and coordinate pickup.' },
              { num: '04', title: 'Food Delivered', desc: 'Food reaches people in need. Transaction confirmed by all parties.' },
            ].map((step, i) => (
              <div key={i} style={lp.stepCard}>
                <div style={lp.stepNum}>{step.num}</div>
                <h3 style={lp.stepTitle}>{step.title}</h3>
                <p style={lp.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Who is it for */}
      <div style={{ ...lp.section, background: '#F9FAFB' }}>
        <div style={lp.sectionInner}>
          <p style={lp.sectionTag}>Who is it for</p>
          <h2 style={lp.sectionTitle}>Built for everyone in the chain</h2>
          <div style={lp.rolesGrid}>
            {[
              { title: 'Restaurants', desc: 'Post surplus food listings, manage claims, get acknowledgement.' },
              { title: 'Volunteers', desc: 'Browse food, claim listings, coordinate pickup with restaurants.' },
              { title: 'NGOs', desc: 'Claim food in bulk, manage distribution for your community.' },
              { title: 'Admins', desc: 'Oversee all listings, approve content, complete transactions.' },
            ].map((r, i) => (
              <div key={i} style={lp.roleCard}>
                <h3 style={lp.roleTitle}>{r.title}</h3>
                <p style={lp.roleDesc}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={lp.cta}>
        <div style={lp.ctaInner}>
          <h2 style={lp.ctaTitle}>Ready to make a difference?</h2>
          <p style={lp.ctaSub}>Join AharaSetu today — free for everyone.</p>
          <div style={lp.heroBtns}>
            <button style={lp.primaryBtn} onClick={() => navigate('/register')}>
              Create an Account
            </button>
            <button style={{ ...lp.secondaryBtn, borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }} onClick={() => navigate('/contact')}>
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={lp.footer}>
        <p style={lp.footerText}>© 2025 AharaSetu — Connecting surplus food with people in need</p>
        <div style={lp.footerLinks}>
          <button style={lp.footerLink} onClick={() => navigate('/login')}>Login</button>
          <button style={lp.footerLink} onClick={() => navigate('/register')}>Register</button>
          <button style={lp.footerLink} onClick={() => navigate('/contact')}>Contact</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. RESTAURANT HOME PAGE
// ─────────────────────────────────────────────
function RestaurantHome({ user, navigate }) {
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0 });
  const { token } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/food/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listings = res.data;
      setStats({
        total: listings.length,
        active: listings.filter(l => l.status === 'available').length,
        completed: listings.filter(l => l.status === 'completed').length,
        pending: listings.filter(l => !l.adminApproved && !l.adminRejected).length,
      });
    } catch (err) { console.error(err); }
  };

  const quickLinks = [
    { label: 'Post Food', desc: 'List your surplus food', path: '/dashboard', color: '#FF5200' },
    { label: 'My Listings', desc: 'Manage your listings', path: '/my-listings', color: '#1C1C1C' },
    { label: 'Contact', desc: 'Get support', path: '/contact', color: '#6B7280' },
  ];

  return (
    <div style={rh.page}>

      {/* Hero */}
      <div style={rh.hero}>
        <div style={rh.heroInner}>
          <p style={rh.heroWelcome}>Welcome back,</p>
          <h1 style={rh.heroName}>{user.name}</h1>
          <p style={rh.heroSub}>
            Thank you for helping reduce food waste. Your contributions make a real difference in people's lives.
          </p>
          <button style={rh.postBtn} onClick={() => navigate('/dashboard')}>
            Post Food Now
          </button>
        </div>
      </div>

      <div style={rh.wrap}>

        {/* Stats */}
        <div style={rh.statsGrid}>
          {[
            { val: stats.total, lbl: 'Total Posted' },
            { val: stats.active, lbl: 'Live Now' },
            { val: stats.completed, lbl: 'Completed' },
            { val: stats.pending, lbl: 'Pending Review' },
          ].map((s, i) => (
            <div key={i} style={rh.statCard}>
              <span style={rh.statVal}>{s.val}</span>
              <span style={rh.statLbl}>{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <h2 style={rh.sectionTitle}>Quick Actions</h2>
        <div style={rh.linksGrid}>
          {quickLinks.map((link, i) => (
            <div key={i} style={rh.linkCard} onClick={() => navigate(link.path)}>
              <div style={{ ...rh.linkDot, background: link.color }} />
              <div>
                <p style={rh.linkTitle}>{link.label}</p>
                <p style={rh.linkDesc}>{link.desc}</p>
              </div>
              <span style={rh.linkArrow}>→</span>
            </div>
          ))}
        </div>

        {/* About Section */}
        <div style={rh.aboutBox}>
          <h2 style={rh.aboutTitle}>About AharaSetu</h2>
          <p style={rh.aboutText}>
            AharaSetu (meaning "Food Bridge") connects restaurants with surplus food to volunteers, NGOs, and communities in need. Every listing you post goes through admin review before reaching people who need it most.
          </p>
          <div style={rh.aboutFeatures}>
            {[
              { title: 'Admin Verified', desc: 'Every listing reviewed before going live' },
              { title: 'Real Payments', desc: 'Stripe-powered secure payments and refunds' },
              { title: 'Full Tracking', desc: 'Track every listing from post to completion' },
              { title: 'Email Alerts', desc: 'Notifications at every step of the process' },
            ].map((f, i) => (
              <div key={i} style={rh.featureItem}>
                <div style={rh.featureDot} />
                <div>
                  <p style={rh.featureTitle}>{f.title}</p>
                  <p style={rh.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. FOOD BROWSE PAGE (Volunteer / NGO / User)
// ─────────────────────────────────────────────
function FoodBrowsePage({ user, token, navigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [claimQty, setClaimQty] = useState({});

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API}/api/food`);
      setListings(res.data);
      fetchRatings(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchRatings = async (listings) => {
    const r = {};
    await Promise.all(listings.map(async (item) => {
      try {
        const res = await axios.get(`${API}/api/ratings/average/${item.postedBy._id}`);
        r[item.postedBy._id] = res.data;
      } catch (err) {}
    }));
    setRatings(r);
  };

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (item) => {
    if (!token) { navigate('/login'); return; }

    const qty = claimQty[item._id] || 1;

    // Regular user restrictions
    if (user?.role === 'user') {
      if (item.quantityUnit === 'kg') {
        setMessage('Regular users can only claim food listed in plates.');
        return;
      }
      if (qty > 2) {
        setMessage('Regular users can claim maximum 2 plates per order.');
        return;
      }
    }

    try {
      const res = await axios.put(
        `${API}/api/food/claim/${item._id}`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (item.type === 'paid') {
        navigate(`/payment/${item._id}`);
      } else {
        setMessage('Claim requested! Waiting for restaurant approval.');
        fetchListings();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong!');
    }
  };

  const filtered = listings.filter(item => {
    const matchFilter = filter === 'all' || item.type === filter;
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.postedBy?.name?.toLowerCase().includes(search.toLowerCase());
    // Regular users can only see plates
    if (user?.role === 'user' && item.quantityUnit === 'kg') return false;
    return matchFilter && matchSearch;
  });

  if (loading) return (
    <div style={fb.loadingPage}>
      <div style={fb.spinner} />
      <p style={fb.loadingText}>Finding food near you...</p>
    </div>
  );

  return (
    <div style={fb.page}>

      {/* Hero */}
      <div style={fb.hero}>
        <div style={fb.heroInner}>
          <h1 style={fb.heroTitle}>
            {user ? `Hello, ${user.name}` : 'Find Food Near You'}
          </h1>
          <p style={fb.heroSub}>Browse verified food listings from restaurants near you.</p>
          <div style={fb.searchBox}>
            <input
              style={fb.searchInput}
              placeholder="Search food or restaurant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={fb.heroStats}>
          <div style={fb.heroStat}>
            <span style={fb.heroStatVal}>{listings.length}</span>
            <span style={fb.heroStatLbl}>Live Listings</span>
          </div>
          <div style={fb.heroStatDiv} />
          <div style={fb.heroStat}>
            <span style={fb.heroStatVal}>{listings.filter(l => l.type === 'free').length}</span>
            <span style={fb.heroStatLbl}>Free Today</span>
          </div>
          <div style={fb.heroStatDiv} />
          <div style={fb.heroStat}>
            <span style={fb.heroStatVal}>{listings.filter(l => l.type === 'paid').length}</span>
            <span style={fb.heroStatLbl}>Discounted</span>
          </div>
        </div>
      </div>

      <div style={fb.main}>

        {/* Filters */}
        <div style={fb.filterRow}>
          <div style={fb.filterTabs}>
            {[
              { key: 'all', label: 'All' },
              { key: 'free', label: 'Free' },
              { key: 'paid', label: 'Discounted' },
            ].map(f => (
              <button
                key={f.key}
                style={{ ...fb.filterTab, ...(filter === f.key ? fb.filterTabActive : {}) }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={fb.resultCount}>{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...fb.msgBox,
            background: message.includes('Claim') ? '#F0FDF4' : '#FEF2F2',
            borderColor: message.includes('Claim') ? '#BBF7D0' : '#FECACA',
            color: message.includes('Claim') ? '#16A34A' : '#DC2626',
          }}>
            {message}
            <button style={fb.msgClose} onClick={() => setMessage('')}>✕</button>
          </div>
        )}

        {/* Regular user notice */}
        {user?.role === 'user' && (
          <div style={fb.noticeBox}>
            Regular users can claim up to 2 plates per order and 3 orders per day. Only plate-based listings are shown.
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={fb.empty}>
            <h3 style={fb.emptyTitle}>No listings found</h3>
            <p style={fb.emptySub}>{search ? 'Try a different search term' : 'Check back soon!'}</p>
          </div>
        ) : (
          <div style={fb.grid}>
            {filtered.map(item => {
              const rating = ratings[item.postedBy?._id];
              const maxQty = item.remainingQuantity || item.quantity;
              const isUser = user?.role === 'user';
              const maxAllowed = isUser ? Math.min(2, maxQty) : maxQty;

              return (
                <div key={item._id} style={fb.card}>

                  {/* Header */}
                  <div style={fb.cardHeader}>
                    <span style={{
                      ...fb.typeBadge,
                      background: item.type === 'free'
                        ? 'linear-gradient(135deg, #16A34A, #22C55E)'
                        : 'linear-gradient(135deg, #FF5200, #FF8C00)',
                    }}>
                      {item.type === 'free' ? 'Free' : `₹${item.price}`}
                    </span>
                    <span style={fb.expiryTag}>
                      Expires {new Date(item.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Food Info */}
                  <h3 style={fb.foodTitle}>{item.title}</h3>
                  {item.description && <p style={fb.foodDesc}>{item.description}</p>}

                  {/* Quantity info */}
                  <div style={fb.qtyInfo}>
                    <span style={fb.qtyChip}>
                      Available: {item.remainingQuantity ?? item.quantity} {item.quantityUnit || 'plates'}
                    </span>
                  </div>

                  <div style={fb.cardDivider} />

                  {/* Restaurant */}
                  <div style={fb.restaurantRow}>
                    <div style={fb.restaurantAvatar}>
                      {item.postedBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={fb.restaurantInfo}>
                      <span style={fb.restaurantName}>{item.postedBy?.name}</span>
                      <span style={fb.restaurantAddr}>{item.address}</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={fb.contactRow}>
                    <a href={`tel:${item.phone}`} style={fb.contactChip}>{item.phone}</a>
                    <a href={`mailto:${item.contactEmail}`} style={fb.contactChip}>Email</a>
                  </div>

                  {/* Rating */}
                  <div style={fb.ratingRow}>
                    {rating?.average ? (
                      <>
                        <StarRating value={parseFloat(rating.average)} readOnly size="14px" />
                        <span style={fb.ratingNum}>{rating.average}</span>
                        <span style={fb.ratingCount}>({rating.total})</span>
                      </>
                    ) : (
                      <span style={fb.noRating}>No ratings yet</span>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div style={fb.qtySelector}>
                    <label style={fb.qtySelectorLabel}>
                      Quantity to claim ({item.quantityUnit || 'plates'}):
                    </label>
                    <div style={fb.qtyControls}>
                      <button
                        style={fb.qtyBtn}
                        onClick={() => setClaimQty(prev => ({
                          ...prev,
                          [item._id]: Math.max(1, (prev[item._id] || 1) - 1)
                        }))}
                      >−</button>
                      <span style={fb.qtyNum}>{claimQty[item._id] || 1}</span>
                      <button
                        style={fb.qtyBtn}
                        onClick={() => setClaimQty(prev => ({
                          ...prev,
                          [item._id]: Math.min(maxAllowed, (prev[item._id] || 1) + 1)
                        }))}
                      >+</button>
                    </div>
                    {isUser && <p style={fb.qtyNote}>Max 2 plates per order</p>}
                  </div>

                  {/* Claim Button */}
                  <button
                    style={{
                      ...fb.claimBtn,
                      background: item.type === 'free'
                        ? 'linear-gradient(135deg, #FF5200, #FF6B35)'
                        : 'linear-gradient(135deg, #1C1C1C, #2D2D2D)',
                    }}
                    onClick={() => handleClaim(item)}
                  >
                    {item.type === 'free'
                      ? `Claim ${claimQty[item._id] || 1} ${item.quantityUnit || 'plate'}${(claimQty[item._id] || 1) > 1 ? 's' : ''}`
                      : `Claim & Pay ₹${item.price}`}
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

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

// Landing Page styles
const lp = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  hero: { background: 'linear-gradient(145deg, #1C1C1C 0%, #2D2D2D 100%)', padding: '80px 32px 72px', textAlign: 'center' },
  heroInner: { maxWidth: '640px', margin: '0 auto' },
  heroBadge: { display: 'inline-block', background: 'rgba(255,82,0,0.15)', border: '1px solid rgba(255,82,0,0.3)', color: '#FF8C00', fontSize: '0.72rem', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' },
  heroTitle: { fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '800', color: 'white', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '18px' },
  heroOrange: { color: '#FF5200' },
  heroSub: { fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { padding: '13px 28px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,82,0,0.35)' },
  secondaryBtn: { padding: '13px 28px', background: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer' },
  statsBar: { display: 'flex', justifyContent: 'center', gap: '0', background: 'white', borderBottom: '1px solid #F0F0F0', flexWrap: 'wrap' },
  statItem: { padding: '24px 40px', textAlign: 'center', borderRight: '1px solid #F0F0F0' },
  statVal: { display: 'block', fontSize: '1.8rem', fontWeight: '800', color: '#FF5200', letterSpacing: '-0.03em' },
  statLbl: { display: 'block', fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' },
  section: { padding: '72px 32px', background: 'white' },
  sectionInner: { maxWidth: '1080px', margin: '0 auto' },
  sectionTag: { fontSize: '0.72rem', fontWeight: '700', color: '#FF5200', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' },
  sectionTitle: { fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#1C1C1C', letterSpacing: '-0.03em', marginBottom: '40px' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  stepCard: { background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '24px' },
  stepNum: { fontSize: '1.8rem', fontWeight: '900', color: '#FF5200', opacity: 0.3, lineHeight: 1, marginBottom: '12px', letterSpacing: '-0.04em' },
  stepTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' },
  stepDesc: { fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 },
  rolesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  roleCard: { background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '22px' },
  roleTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px' },
  roleDesc: { fontSize: '0.83rem', color: '#6B7280', lineHeight: 1.6 },
  cta: { background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)', padding: '72px 32px', textAlign: 'center' },
  ctaInner: { maxWidth: '560px', margin: '0 auto' },
  ctaTitle: { fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: 'white', letterSpacing: '-0.03em', marginBottom: '10px' },
  ctaSub: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', marginBottom: '32px' },
  footer: { background: '#1C1C1C', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  footerText: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' },
  footerLinks: { display: 'flex', gap: '4px' },
  footerLink: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', cursor: 'pointer', padding: '4px 10px' },
};

// Restaurant Home styles
const rh = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  hero: { background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)', padding: '56px 32px 48px' },
  heroInner: { maxWidth: '680px', margin: '0 auto' },
  heroWelcome: { fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', letterSpacing: '0.02em' },
  heroName: { fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '800', color: 'white', letterSpacing: '-0.03em', marginBottom: '14px', lineHeight: 1.1 },
  heroSub: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '28px', maxWidth: '460px' },
  postBtn: { padding: '13px 28px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,82,0,0.35)' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '36px 24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '36px' },
  statCard: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  statVal: { display: 'block', fontSize: '1.8rem', fontWeight: '800', color: '#FF5200', lineHeight: 1 },
  statLbl: { display: 'block', fontSize: '0.7rem', color: '#9CA3AF', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '14px', letterSpacing: '-0.01em' },
  linksGrid: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' },
  linkCard: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'border-color 0.15s' },
  linkDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  linkTitle: { fontSize: '0.92rem', fontWeight: '600', color: '#1C1C1C', marginBottom: '2px' },
  linkDesc: { fontSize: '0.78rem', color: '#9CA3AF' },
  linkArrow: { marginLeft: 'auto', color: '#9CA3AF', fontSize: '1rem' },
  aboutBox: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  aboutTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '10px', letterSpacing: '-0.01em' },
  aboutText: { fontSize: '0.88rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '22px' },
  aboutFeatures: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' },
  featureItem: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  featureDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#FF5200', marginTop: '5px', flexShrink: 0 },
  featureTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C', marginBottom: '2px' },
  featureDesc: { fontSize: '0.78rem', color: '#9CA3AF', lineHeight: 1.5 },
};

// Food Browse styles
const fb = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '64px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #F3F4F6', borderTop: '3px solid #FF5200', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9CA3AF', fontSize: '0.9rem' },
  hero: { background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)', padding: '48px 32px 36px' },
  heroInner: { maxWidth: '600px', margin: '0 auto', textAlign: 'center' },
  heroTitle: { fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: '800', color: 'white', letterSpacing: '-0.03em', marginBottom: '10px' },
  heroSub: { fontSize: '0.92rem', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' },
  searchBox: { background: 'white', borderRadius: '10px', padding: '10px 16px', maxWidth: '440px', margin: '0 auto 28px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  searchInput: { width: '100%', border: 'none', outline: 'none', fontSize: '0.92rem', color: '#1C1C1C', background: 'transparent' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: '28px' },
  heroStat: { textAlign: 'center' },
  heroStatVal: { display: 'block', fontSize: '1.6rem', fontWeight: '800', color: '#FF5200', lineHeight: 1 },
  heroStatLbl: { display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  heroStatDiv: { width: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' },
  main: { maxWidth: '1180px', margin: '0 auto', padding: '28px 24px' },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  filterTabs: { display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid #E5E7EB' },
  filterTab: { padding: '7px 14px', borderRadius: '7px', border: 'none', background: 'transparent', fontSize: '0.84rem', fontWeight: '500', color: '#6B7280', cursor: 'pointer' },
  filterTabActive: { background: '#FF5200', color: 'white', boxShadow: '0 2px 8px rgba(255,82,0,0.25)' },
  resultCount: { fontSize: '0.82rem', color: '#9CA3AF' },
  msgBox: { padding: '12px 16px', borderRadius: '10px', border: '1px solid', fontSize: '0.88rem', fontWeight: '500', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  msgClose: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'inherit', opacity: 0.6 },
  noticeBox: { background: '#FFF8F5', border: '1px solid rgba(255,82,0,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#6B7280', marginBottom: '16px' },
  empty: { background: 'white', borderRadius: '14px', padding: '56px 24px', textAlign: 'center', border: '1px solid #F0F0F0' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px' },
  emptySub: { fontSize: '0.88rem', color: '#9CA3AF' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' },
  card: { background: 'white', borderRadius: '14px', padding: '18px', border: '1px solid #F0F0F0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { color: 'white', fontSize: '0.76rem', fontWeight: '700', padding: '4px 11px', borderRadius: '20px' },
  expiryTag: { fontSize: '0.72rem', color: '#9CA3AF', background: '#F9FAFB', padding: '3px 9px', borderRadius: '20px', border: '1px solid #E5E7EB' },
  foodTitle: { fontSize: '1rem', fontWeight: '700', color: '#1C1C1C', margin: 0, letterSpacing: '-0.01em' },
  foodDesc: { fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5, margin: 0 },
  qtyInfo: { display: 'flex' },
  qtyChip: { fontSize: '0.76rem', color: '#374151', background: '#F9FAFB', padding: '3px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontWeight: '500' },
  cardDivider: { height: '1px', background: '#F3F4F6' },
  restaurantRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  restaurantAvatar: { width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #FF5200, #FF8C00)', color: 'white', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  restaurantInfo: { display: 'flex', flexDirection: 'column', gap: '1px' },
  restaurantName: { fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C' },
  restaurantAddr: { fontSize: '0.74rem', color: '#9CA3AF' },
  contactRow: { display: 'flex', gap: '6px' },
  contactChip: { flex: 1, padding: '6px 10px', borderRadius: '7px', background: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: '0.74rem', color: '#374151', fontWeight: '500', textAlign: 'center', textDecoration: 'none' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', background: '#FFFBEB', borderRadius: '7px', border: '1px solid #FDE68A' },
  ratingNum: { fontSize: '0.82rem', fontWeight: '700', color: '#F59E0B' },
  ratingCount: { fontSize: '0.74rem', color: '#9CA3AF' },
  noRating: { fontSize: '0.74rem', color: '#9CA3AF' },
  qtySelector: { background: '#F9FAFB', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E5E7EB' },
  qtySelectorLabel: { fontSize: '0.75rem', color: '#6B7280', fontWeight: '500', display: 'block', marginBottom: '8px' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '12px' },
  qtyBtn: { width: '28px', height: '28px', borderRadius: '7px', border: '1.5px solid #E5E7EB', background: 'white', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#374151' },
  qtyNum: { fontSize: '1rem', fontWeight: '700', color: '#1C1C1C', minWidth: '28px', textAlign: 'center' },
  qtyNote: { fontSize: '0.7rem', color: '#9CA3AF', marginTop: '5px' },
  claimBtn: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', marginTop: 'auto' },
};



export default Home;