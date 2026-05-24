import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [token, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend-pov2.onrender.com/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.count);
    } catch (err) {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('https://aharasetu-backend-pov2.onrender.com/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {}
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('https://aharasetu-backend-pov2.onrender.com/api/notifications/mark-all-read', {},
        { headers: { Authorization: `Bearer ${token}` } });
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {}
  };

  const handleMarkOneRead = async (id) => {
    try {
      await axios.put(`https://aharasetu-backend-pov2.onrender.com/api/notifications/mark-read/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {}
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete('https://aharasetu-backend-pov2.onrender.com/api/notifications/delete-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {}
  };

  const getTimeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const getIcon = (type) => ({
    new_listing: '🍱', listing_approved: '✅', listing_rejected: '❌',
    new_claim: '📦', claim_approved: '✅', claim_rejected: '❌',
    payment_received: '💳', both_acknowledged: '🔔', transaction_completed: '🎉',
  }[type] || '🔔');

  return (
    <div style={styles.wrap} ref={dropdownRef}>
      <button style={styles.bellBtn} onClick={handleOpen}>
        <span style={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={styles.dropdownTitle}>
              <span style={styles.dropdownTitleText}>Notifications</span>
              {unreadCount > 0 && (
                <span style={styles.unreadPill}>{unreadCount} new</span>
              )}
            </div>
            <div style={styles.headerActions}>
              {unreadCount > 0 && (
                <button style={styles.markReadBtn} onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button style={styles.deleteBtn} onClick={handleDeleteAll}>
                  🗑️
                </button>
              )}
            </div>
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <div style={styles.emptyIcon}>🔔</div>
                <p style={styles.emptyTitle}>All caught up!</p>
                <p style={styles.emptySub}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  style={{
                    ...styles.notifItem,
                    background: n.isRead ? 'white' : '#FFF8F5',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid #FF5200',
                  }}
                  onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                >
                  <div style={styles.notifIconWrap}>
                    {getIcon(n.type)}
                  </div>
                  <div style={styles.notifContent}>
                    <p style={styles.notifMsg}>{n.message}</p>
                    <p style={styles.notifTime}>{getTimeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: 'relative' },
  bellBtn: {
    position: 'relative', background: '#F9FAFB',
    border: '1px solid #E5E7EB', borderRadius: '10px',
    width: '38px', height: '38px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  bellIcon: { fontSize: '1rem' },
  badge: {
    position: 'absolute', top: '-6px', right: '-6px',
    background: '#FF5200', color: 'white',
    borderRadius: '50%', width: '18px', height: '18px',
    fontSize: '0.6rem', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid white',
  },
  dropdown: {
    position: 'absolute', right: 0, top: '46px',
    width: '360px', background: 'white',
    borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
    border: '1px solid #F0F0F0', zIndex: 1000, overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 18px', borderBottom: '1px solid #F3F4F6',
    background: '#FAFAFA',
  },
  dropdownTitle: { display: 'flex', alignItems: 'center', gap: '8px' },
  dropdownTitleText: { fontSize: '0.92rem', fontWeight: '700', color: '#1C1C1C' },
  unreadPill: { background: '#FF5200', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },
  headerActions: { display: 'flex', gap: '6px', alignItems: 'center' },
  markReadBtn: { background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', color: '#6B7280', cursor: 'pointer', fontWeight: '500' },
  deleteBtn: { background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' },
  list: { maxHeight: '380px', overflowY: 'auto' },
  empty: { padding: '40px 20px', textAlign: 'center' },
  emptyIcon: { fontSize: '2rem', marginBottom: '8px' },
  emptyTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px' },
  emptySub: { fontSize: '0.78rem', color: '#9CA3AF' },
  notifItem: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '13px 16px', borderBottom: '1px solid #F9FAFB',
    cursor: 'pointer', transition: 'background 0.15s',
  },
  notifIconWrap: { fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' },
  notifContent: { flex: 1 },
  notifMsg: { fontSize: '0.82rem', color: '#1C1C1C', lineHeight: 1.45, marginBottom: '4px', fontWeight: '500' },
  notifTime: { fontSize: '0.7rem', color: '#9CA3AF' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#FF5200', flexShrink: 0, marginTop: '5px' },
};

export default NotificationBell;