import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🍱 AharaSetu</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <span style={styles.welcome}>
              Hello, {user.name} ({user.role})
            </span>

            {user.role === 'admin' && (
              <Link to="/admin" style={styles.link}>🛡️ Admin Panel</Link>
            )}

            {user.role === 'restaurant' && (
              <>
                <Link to="/dashboard" style={styles.link}>🍛 Post Food</Link>
                <Link to="/my-listings" style={styles.link}>📋 My Listings</Link>
                <Link to="/contact" style={styles.link}>📬 Contact</Link>
              </>
            )}

            {(user.role === 'volunteer' || user.role === 'ngo' || user.role === 'user') && (
              <>
                <Link to="/" style={styles.link}>🍱 Browse Food</Link>
                <Link to="/my-claims" style={styles.link}>📦 My Claims</Link>
                <Link to="/contact" style={styles.link}>📬 Contact</Link>
              </>
            )}
            {user && <NotificationBell />}
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/" style={styles.link}>🍱 Browse Food</Link>
            <Link to="/contact" style={styles.link}>📬 Contact</Link>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#2e7d32',
    color: 'white',
    flexWrap: 'wrap',
    gap: '10px',
  },
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
  },
  welcome: {
    color: '#c8e6c9',
    fontSize: '13px',
  },
  btn: {
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  }
};

export default Navbar;