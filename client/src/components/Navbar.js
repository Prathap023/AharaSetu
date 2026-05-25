import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navInner}>

          {/* Brand */}
          <Link to="/" style={styles.brand} onClick={closeMenu}>
            <div style={styles.brandIcon}>🍱</div>
            <span style={styles.brandText}>AharaSetu</span>
          </Link>

          {/* Desktop Links */}
          {!isMobile && (
            <div style={styles.desktopLinks}>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      style={{
                        ...styles.navLink,
                        ...(isActive('/admin') ? styles.navLinkActive : {})
                      }}
                    >
                      Admin Panel
                    </Link>
                  )}

                  {user.role === 'restaurant' && (
                    <>
                      <Link
                        to="/dashboard"
                        style={{
                          ...styles.navLink,
                          ...(isActive('/dashboard') ? styles.navLinkActive : {})
                        }}
                      >
                        Post Food
                      </Link>

                      <Link
                        to="/my-listings"
                        style={{
                          ...styles.navLink,
                          ...(isActive('/my-listings') ? styles.navLinkActive : {})
                        }}
                      >
                        My Listings
                      </Link>

                      <Link
                        to="/contact"
                        style={{
                          ...styles.navLink,
                          ...(isActive('/contact') ? styles.navLinkActive : {})
                        }}
                      >
                        Contact
                      </Link>
                    </>
                  )}

                  {(user.role === 'volunteer' ||
                    user.role === 'ngo' ||
                    user.role === 'user') && (
                    <>
                      <Link
                        to="/"
                        style={{
                          ...styles.navLink,
                          ...(isActive('/') ? styles.navLinkActive : {})
                        }}
                      >
                        Browse Food
                      </Link>

                      <Link
                        to="/my-claims"
                        style={{
                          ...styles.navLink,
                          ...(isActive('/my-claims') ? styles.navLinkActive : {})
                        }}
                      >
                        My Claims
                      </Link>

                      <Link
                        to="/contact"
                        style={{
                          ...styles.navLink,
                          ...(isActive('/contact') ? styles.navLinkActive : {})
                        }}
                      >
                        Contact
                      </Link>

                      <a
                        href="https://aharasetu-report.onrender.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.navLink}
                      >
                        What We Have Done
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/" style={styles.navLink}>
                    Browse Food
                  </Link>

                  <Link to="/contact" style={styles.navLink}>
                    Contact
                  </Link>

                  <a
                    href="https://aharasetu-report.onrender.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.navLink}
                  >
                    What We Have Done
                  </a>
                </>
              )}
            </div>
          )}

          {/* Right Side */}
          <div style={styles.rightSide}>

            {/* Desktop User Section */}
            {!isMobile && (
              <>
                {user ? (
                  <>
                    <NotificationBell />

                    <div style={styles.userChip}>
                      <div style={styles.userAvatar}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      <div style={styles.userInfo}>
                        <span style={styles.userName}>
                          {user.name}
                        </span>

                        <span style={styles.userRole}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={styles.logoutBtn}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" style={styles.loginBtn}>
                      Login
                    </Link>

                    <Link to="/register" style={styles.registerBtn}>
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <button
                style={{
                  ...styles.menuToggle,
                  ...(menuOpen ? styles.menuToggleActive : {})
                }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span style={{
                  ...styles.bar,
                  ...(menuOpen ? styles.bar1Active : {})
                }} />

                <span style={{
                  ...styles.bar,
                  ...(menuOpen ? styles.bar2Active : {})
                }} />

                <span style={{
                  ...styles.bar,
                  ...(menuOpen ? styles.bar3Active : {})
                }} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && isMobile && (
        <div style={styles.mobileMenu}>

          {user ? (
            <>
              <div style={styles.mobileUser}>
                <div style={styles.mobileUserAvatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div style={styles.mobileUserName}>
                    {user.name}
                  </div>

                  <div style={styles.mobileUserRole}>
                    {user.role}
                  </div>
                </div>
              </div>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  style={styles.mobileLink}
                  onClick={closeMenu}
                >
                  🛡️ Admin Panel
                </Link>
              )}

              {user.role === 'restaurant' && (
                <>
                  <Link
                    to="/dashboard"
                    style={styles.mobileLink}
                    onClick={closeMenu}
                  >
                    🍛 Post Food
                  </Link>

                  <Link
                    to="/my-listings"
                    style={styles.mobileLink}
                    onClick={closeMenu}
                  >
                    📋 My Listings
                  </Link>

                  <Link
                    to="/contact"
                    style={styles.mobileLink}
                    onClick={closeMenu}
                  >
                    📬 Contact
                  </Link>
                </>
              )}

              {(user.role === 'volunteer' ||
                user.role === 'ngo' ||
                user.role === 'user') && (
                <>
                  <Link
                    to="/"
                    style={styles.mobileLink}
                    onClick={closeMenu}
                  >
                    🍱 Browse Food
                  </Link>

                  <Link
                    to="/my-claims"
                    style={styles.mobileLink}
                    onClick={closeMenu}
                  >
                    📦 My Claims
                  </Link>

                  <Link
                    to="/contact"
                    style={styles.mobileLink}
                    onClick={closeMenu}
                  >
                    📬 Contact
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                style={styles.mobileLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                style={styles.mobileLink}
                onClick={closeMenu}
              >
                🍱 Browse Food
              </Link>

              <Link
                to="/contact"
                style={styles.mobileLink}
                onClick={closeMenu}
              >
                📬 Contact
              </Link>

              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={styles.mobileRegister}
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {

  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,

    background: 'rgba(255,255,255,0.96)',

    backdropFilter: 'blur(14px)',

    borderBottom: '1px solid rgba(255,82,0,0.08)',

    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',

    height: '64px',
  },

  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',

    padding: '0 20px',

    height: '100%',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',

    textDecoration: 'none',
  },

  brandIcon: {
    width: '38px',
    height: '38px',

    borderRadius: '12px',

    background: 'linear-gradient(135deg,#FF5200,#FF8C00)',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontSize: '18px',

    boxShadow: '0 4px 12px rgba(255,82,0,0.3)',
  },

  brandText: {
    fontSize: '1.1rem',
    fontWeight: '800',

    color: '#1C1C1C',

    letterSpacing: '-0.02em',
  },

  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  navLink: {
    padding: '8px 14px',

    borderRadius: '10px',

    fontSize: '0.85rem',

    fontWeight: '600',

    color: '#6B6B6B',

    textDecoration: 'none',

    transition: 'all 0.2s ease',
  },

  navLinkActive: {
    background: '#FFF0EB',
    color: '#FF5200',
  },

  rightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  menuToggle: {
    width: '42px',
    height: '42px',

    borderRadius: '12px',

    background: 'rgba(255,82,0,0.12)',

    border: '1px solid rgba(255,82,0,0.18)',

    display: 'flex',
    flexDirection: 'column',

    alignItems: 'center',
    justifyContent: 'center',

    gap: '5px',

    cursor: 'pointer',
  },

  menuToggleActive: {
    background: 'rgba(255,82,0,0.2)',
  },

  bar: {
    width: '18px',
    height: '2px',

    background: '#FF5200',

    borderRadius: '20px',

    transition: 'all 0.3s ease',
  },

  bar1Active: {
    transform: 'rotate(45deg) translate(5px, 5px)',
  },

  bar2Active: {
    opacity: 0,
  },

  bar3Active: {
    transform: 'rotate(-45deg) translate(5px, -5px)',
  },

  mobileMenu: {
    position: 'fixed',

    top: '74px',
    left: '16px',
    right: '16px',

    zIndex: 999,

    background: '#1f1f1f',

    border: '1px solid rgba(255,82,0,0.16)',

    borderRadius: '20px',

    padding: '18px',

    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',

    display: 'flex',
    flexDirection: 'column',

    gap: '8px',
  },

  mobileUser: {
    display: 'flex',
    alignItems: 'center',

    gap: '12px',

    paddingBottom: '14px',

    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },

  mobileUserAvatar: {
    width: '42px',
    height: '42px',

    borderRadius: '50%',

    background: 'linear-gradient(135deg,#FF5200,#FF8C00)',

    color: 'white',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontWeight: '700',
  },

  mobileUserName: {
    color: 'white',
    fontWeight: '700',
  },

  mobileUserRole: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.8rem',
  },

  mobileLink: {
    padding: '13px 14px',

    borderRadius: '12px',

    color: 'rgba(255,255,255,0.78)',

    textDecoration: 'none',

    fontWeight: '600',

    transition: 'all 0.2s ease',
  },

  mobileLogout: {
    marginTop: '8px',

    padding: '13px 14px',

    borderRadius: '12px',

    border: 'none',

    background: 'rgba(255,82,0,0.14)',

    color: '#FF5200',

    fontWeight: '700',

    cursor: 'pointer',
  },

  mobileRegister: {
    marginTop: '8px',

    padding: '13px 14px',

    borderRadius: '12px',

    background: '#FF5200',

    color: 'white',

    textDecoration: 'none',

    textAlign: 'center',

    fontWeight: '700',
  },

  userChip: {
    display: 'flex',
    alignItems: 'center',

    gap: '8px',

    padding: '6px 12px 6px 6px',

    background: '#F9FAFB',

    border: '1px solid #E5E7EB',

    borderRadius: '100px',
  },

  userAvatar: {
    width: '30px',
    height: '30px',

    borderRadius: '50%',

    background: 'linear-gradient(135deg,#FF5200,#FF8C00)',

    color: 'white',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    fontWeight: '700',
  },

  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },

  userName: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#1C1C1C',
  },

  userRole: {
    fontSize: '0.7rem',
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },

  logoutBtn: {
    padding: '8px 16px',

    borderRadius: '10px',

    border: '1px solid #E5E7EB',

    background: 'transparent',

    color: '#6B6B6B',

    cursor: 'pointer',

    fontWeight: '600',
  },

  loginBtn: {
    color: '#1C1C1C',
    textDecoration: 'none',
    fontWeight: '600',
  },

  registerBtn: {
    padding: '8px 18px',

    borderRadius: '10px',

    background: '#FF5200',

    color: 'white',

    textDecoration: 'none',

    fontWeight: '700',

    boxShadow: '0 4px 12px rgba(255,82,0,0.25)',
  },
};

export default Navbar;