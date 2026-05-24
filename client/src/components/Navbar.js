import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {/* Brand */}
          <Link to="/" style={styles.brand}>
            <div style={styles.brandIcon}>🍱</div>
            <span style={styles.brandText}>AharaSetu</span>
          </Link>

          {/* Desktop Links */}
          <div style={styles.desktopLinks}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" style={{
                    ...styles.navLink,
                    ...(isActive('/admin') ? styles.navLinkActive : {})
                  }}>Admin Panel</Link>
                )}
                {user.role === 'restaurant' && (
                  <>
                    <Link to="/dashboard" style={{
                      ...styles.navLink,
                      ...(isActive('/dashboard') ? styles.navLinkActive : {})
                    }}>Post Food</Link>
                    <Link to="/my-listings" style={{
                      ...styles.navLink,
                      ...(isActive('/my-listings') ? styles.navLinkActive : {})
                    }}>My Listings</Link>
                    <Link to="/contact" style={{
                      ...styles.navLink,
                      ...(isActive('/contact') ? styles.navLinkActive : {})
                    }}>Contact</Link>
                  </>
                )}
                {(user.role === 'volunteer' || user.role === 'ngo' || user.role === 'user') && (
                  <>
                    <Link to="/" style={{
                      ...styles.navLink,
                      ...(isActive('/') ? styles.navLinkActive : {})
                    }}>Browse Food</Link>
                    <Link to="/my-claims" style={{
                      ...styles.navLink,
                      ...(isActive('/my-claims') ? styles.navLinkActive : {})
                    }}>My Claims</Link>
                    <Link to="/contact" style={{
                      ...styles.navLink,
                      ...(isActive('/contact') ? styles.navLinkActive : {})
                    }}>Contact</Link>
                    <a
                      href="https://aharasetu.in"
                      // target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...styles.navLink,
                        ...(isActive('/about') ? styles.navLinkActive : {})
                      }}
                    >
                      About Us
                    </a>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/" style={styles.navLink}>Browse Food</Link>
                <Link to="/contact" style={styles.navLink}>Contact</Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div style={styles.rightSide}>
            {user ? (
              <>
                <NotificationBell />
                <div style={styles.userChip}>
                  <div style={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>{user.name}</span>
                    <span style={styles.userRole}>{user.role}</span>
                  </div>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.loginBtn}>Login</Link>
                <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              style={styles.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {user ? (
            <>
              <div style={styles.mobileUser}>
                <div style={styles.mobileUserAvatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={styles.mobileUserName}>{user.name}</div>
                  <div style={styles.mobileUserRole}>{user.role}</div>
                </div>
              </div>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🛡️ Admin Panel</Link>
              )}
              {user.role === 'restaurant' && (
                <>
                  <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🍛 Post Food</Link>
                  <Link to="/my-listings" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📋 My Listings</Link>
                  <Link to="/contact" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📬 Contact</Link>
                </>
              )}
              {(user.role === 'volunteer' || user.role === 'ngo' || user.role === 'user') && (
                <>
                  <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🍱 Browse Food</Link>
                  <Link to="/my-claims" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📦 My Claims</Link>
                  <Link to="/contact" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📬 Contact</Link>
                </>
              )}
              <button onClick={handleLogout} style={styles.mobileLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🍱 Browse Food</Link>
              <Link to="/contact" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📬 Contact</Link>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileRegister} onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: '#FFFFFF',
    borderBottom: '1px solid #F0F0F0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    height: '64px',
  },
  navInner: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '0 24px', height: '100%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '24px',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px',
    textDecoration: 'none', flexShrink: 0,
  },
  brandIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', boxShadow: '0 2px 8px rgba(255,82,0,0.3)',
  },
  brandText: {
    fontSize: '1.15rem', fontWeight: '700',
    color: '#1C1C1C', letterSpacing: '-0.02em',
  },
  desktopLinks: {
    display: 'flex', alignItems: 'center', gap: '4px', flex: 1,
    '@media (max-width: 768px)': { display: 'none' },
  },
  navLink: {
    padding: '7px 14px', borderRadius: '8px',
    fontSize: '0.88rem', fontWeight: '500',
    color: '#6B6B6B', textDecoration: 'none',
    transition: 'all 0.15s',
    ':hover': { color: '#FF5200', background: '#FFF0EB' },
  },
  navLinkActive: {
    color: '#FF5200', background: '#FFF0EB', fontWeight: '600',
  },
  rightSide: {
    display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
  },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '5px 12px 5px 6px',
    background: '#F9FAFB', border: '1px solid #E5E7EB',
    borderRadius: '100px',
  },
  userAvatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '0.8rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.8rem', fontWeight: '600', color: '#1C1C1C', lineHeight: 1.2 },
  userRole: { fontSize: '0.68rem', color: '#9CA3AF', textTransform: 'capitalize', lineHeight: 1.2 },
  logoutBtn: {
    padding: '7px 16px', borderRadius: '8px',
    background: 'transparent', border: '1px solid #E5E7EB',
    fontSize: '0.84rem', fontWeight: '500', color: '#6B6B6B',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  loginBtn: {
    padding: '7px 16px', borderRadius: '8px',
    fontSize: '0.88rem', fontWeight: '500',
    color: '#1C1C1C', textDecoration: 'none',
  },
  registerBtn: {
    padding: '7px 18px', borderRadius: '8px',
    background: '#FF5200', color: 'white',
    fontSize: '0.88rem', fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(255,82,0,0.3)',
  },
  menuToggle: {
    display: 'none',
    background: 'none', border: 'none',
    fontSize: '1.2rem', cursor: 'pointer',
    padding: '4px', color: '#1C1C1C',
    '@media (max-width: 768px)': { display: 'block' },
  },
  mobileMenu: {
    position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 999,
    background: 'white', borderBottom: '1px solid #F0F0F0',
    padding: '16px 24px 24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  mobileUser: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 0 16px',
    borderBottom: '1px solid #F0F0F0', marginBottom: '8px',
  },
  mobileUserAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '1rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  mobileUserName: { fontSize: '0.95rem', fontWeight: '600', color: '#1C1C1C' },
  mobileUserRole: { fontSize: '0.78rem', color: '#9CA3AF', textTransform: 'capitalize' },
  mobileLink: {
    padding: '11px 12px', borderRadius: '8px',
    fontSize: '0.92rem', fontWeight: '500',
    color: '#2D2D2D', textDecoration: 'none',
    display: 'block', transition: 'background 0.15s',
  },
  mobileLogout: {
    marginTop: '8px', padding: '11px 12px',
    borderRadius: '8px', background: '#FFF0EB',
    border: 'none', color: '#FF5200',
    fontSize: '0.92rem', fontWeight: '600',
    cursor: 'pointer', textAlign: 'left',
  },
  mobileRegister: {
    marginTop: '8px', padding: '12px',
    borderRadius: '10px', background: '#FF5200',
    color: 'white', fontSize: '0.92rem',
    fontWeight: '600', textAlign: 'center',
    display: 'block', textDecoration: 'none',
  },
};

export default Navbar;