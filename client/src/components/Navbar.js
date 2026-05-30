import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const navLinks = user?.role === 'admin'
    ? [{ to: '/admin', label: 'Admin Panel' }]
    : user?.role === 'restaurant'
    ? [
        { to: '/', label: 'Home' },
        { to: '/dashboard', label: 'Post Food' },
        { to: '/my-listings', label: 'My Listings' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ]
      : user
      ? [
        { to: '/', label: 'Browse Food' },
        { to: '/my-claims', label: 'My Claims' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ];

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.inner}>
          {/* Brand */}
          <Link to="/" style={styles.brand}>
            <div style={styles.brandIcon}>🍱</div>
            <span style={styles.brandText}>AharaSetu</span>
          </Link>

          {/* Desktop Links */}
          <div style={styles.desktopLinks}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.navLink,
                  ...(isActive(link.to) ? styles.navLinkActive : {})
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div style={styles.right}>
            {user ? (
              <>
                <NotificationBell />
                <div
                  style={styles.userChip}
                  onClick={() => navigate('/profile')}
                >
                  <div style={styles.avatar}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>{user.name}</span>
                    <span style={styles.userRole}>{user.role}</span>
                  </div>
                </div>
                {/* Desktop logout */}
                <button
                  style={{ ...styles.logoutBtn, display: 'none' }}
                  className="hide-mobile"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <div style={styles.authBtns}>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
                <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              style={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <div style={{ ...styles.hamLine, ...(menuOpen ? styles.hamLine1Open : {}) }} />
              <div style={{ ...styles.hamLine, ...(menuOpen ? styles.hamLine2Open : {}) }} />
              <div style={{ ...styles.hamLine, ...(menuOpen ? styles.hamLine3Open : {}) }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div style={{
        ...styles.drawer,
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        {user && (
          <div style={styles.drawerUser}>
            <div style={styles.drawerAvatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={styles.drawerName}>{user.name}</p>
              <p style={styles.drawerRole}>{user.role}</p>
            </div>
          </div>
        )}

        <div style={styles.drawerLinks}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.drawerLink,
                ...(isActive(link.to) ? styles.drawerLinkActive : {})
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link to="/profile" style={styles.drawerLink}>Profile</Link>
          )}
        </div>

        {user ? (
          <button style={styles.drawerLogout} onClick={handleLogout}>
            Sign Out
          </button>
        ) : (
          <div style={styles.drawerAuth}>
            <Link to="/login" style={styles.drawerLoginBtn}>Login</Link>
            <Link to="/register" style={styles.drawerRegisterBtn}>Sign Up</Link>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #E5E7EB',
    height: '58px',
    boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '0 20px', height: '100%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '16px',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '8px',
    textDecoration: 'none', flexShrink: 0,
  },
  brandIcon: {
    width: '32px', height: '32px', borderRadius: '9px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px',
  },
  brandText: {
    fontSize: '1.05rem', fontWeight: '800',
    color: '#1C1C1C', letterSpacing: '-0.02em',
  },
  desktopLinks: {
    display: 'flex', alignItems: 'center', gap: '2px', flex: 1,
    '@media (max-width: 768px)': { display: 'none' },
  },
  navLink: {
    padding: '6px 12px', borderRadius: '7px',
    fontSize: '0.85rem', fontWeight: '500',
    color: '#6B7280', textDecoration: 'none',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  navLinkActive: { color: '#FF5200', background: '#FFF0EB', fontWeight: '600' },
  right: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '4px 10px 4px 5px',
    background: '#F9FAFB', border: '1px solid #E5E7EB',
    borderRadius: '100px', cursor: 'pointer',
  },
  avatar: {
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '0.75rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.76rem', fontWeight: '600', color: '#1C1C1C', lineHeight: 1.2 },
  userRole: { fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'capitalize', lineHeight: 1.2 },
  logoutBtn: {
    padding: '6px 14px', borderRadius: '7px',
    background: 'transparent', border: '1px solid #E5E7EB',
    fontSize: '0.82rem', fontWeight: '500', color: '#6B7280', cursor: 'pointer',
  },
  authBtns: { display: 'flex', gap: '6px', alignItems: 'center' },
  loginBtn: { padding: '6px 14px', fontSize: '0.85rem', fontWeight: '500', color: '#1C1C1C' },
  registerBtn: {
    padding: '6px 14px', borderRadius: '7px',
    background: '#FF5200', color: 'white',
    fontSize: '0.85rem', fontWeight: '600',
  },
  hamburger: {
    width: '36px', height: '36px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '5px', background: 'none', border: 'none',
    cursor: 'pointer', padding: '4px', flexShrink: 0,
  },
  hamLine: {
    width: '20px', height: '2px',
    background: '#1C1C1C', borderRadius: '2px',
    transition: 'all 0.25s ease',
    transformOrigin: 'center',
  },
  hamLine1Open: { transform: 'translateY(7px) rotate(45deg)' },
  hamLine2Open: { opacity: 0, transform: 'scaleX(0)' },
  hamLine3Open: { transform: 'translateY(-7px) rotate(-45deg)' },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1001,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(2px)',
  },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1002,
    width: 'min(300px, 85vw)',
    background: 'white',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
    padding: '24px 20px',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowY: 'auto',
    paddingTop: '70px',
  },
  drawerUser: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '0 0 18px',
    borderBottom: '1px solid #F3F4F6',
    marginBottom: '12px',
  },
  drawerAvatar: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '1.1rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  drawerName: { fontSize: '0.92rem', fontWeight: '700', color: '#1C1C1C' },
  drawerRole: { fontSize: '0.74rem', color: '#9CA3AF', textTransform: 'capitalize' },
  drawerLinks: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  drawerLink: {
    padding: '12px 14px', borderRadius: '9px',
    fontSize: '0.92rem', fontWeight: '500',
    color: '#2D2D2D', textDecoration: 'none',
    display: 'block',
  },
  drawerLinkActive: { color: '#FF5200', background: '#FFF0EB', fontWeight: '600' },
  drawerLogout: {
    marginTop: '16px', padding: '12px',
    borderRadius: '9px', background: '#FEF2F2',
    border: 'none', color: '#DC2626',
    fontSize: '0.9rem', fontWeight: '600',
    cursor: 'pointer', textAlign: 'left',
  },
  drawerAuth: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' },
  drawerLoginBtn: {
    padding: '12px', borderRadius: '9px',
    border: '1.5px solid #E5E7EB',
    fontSize: '0.9rem', fontWeight: '600',
    color: '#374151', textAlign: 'center',
    display: 'block',
  },
  drawerRegisterBtn: {
    padding: '12px', borderRadius: '9px',
    background: '#FF5200', color: 'white',
    fontSize: '0.9rem', fontWeight: '600',
    textAlign: 'center', display: 'block',
  },
};

// Hide desktop links on mobile using JS
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 768px) {
      .desktop-links { display: none !important; }
      .user-chip-name { display: none !important; }
    }
    @media (min-width: 769px) {
      .hamburger { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export default Navbar;