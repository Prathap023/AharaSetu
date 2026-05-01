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
    fetchNotifications();

    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [token, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete('http://localhost:5000/api/notifications/delete-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_listing: '🍱',
      listing_approved: '✅',
      listing_rejected: '❌',
      new_claim: '📦',
      claim_approved: '✅',
      claim_rejected: '❌',
      payment_received: '💳',
      both_acknowledged: '🔔',
      transaction_completed: '🎉',
    };
    return icons[type] || '🔔';
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Bell Button */}
      <button style={styles.bellBtn} onClick={handleOpen}>
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* Header */}
          <div style={styles.dropdownHeader}>
            <span style={styles.dropdownTitle}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span style={styles.unreadBadge}>{unreadCount} new</span>
              )}
            </span>
            <div style={styles.headerBtns}>
              {unreadCount > 0 && (
                <button style={styles.markReadBtn} onClick={handleMarkAllRead}>
                  ✓ Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button style={styles.deleteBtn} onClick={handleDeleteAll}>
                  🗑️
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <p>🔔 No notifications yet</p>
                <p style={styles.emptyHint}>You'll be notified about important updates here</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  style={{
                    ...styles.notifItem,
                    backgroundColor: notif.isRead ? 'white' : '#f1f8e9',
                    borderLeft: notif.isRead ? '3px solid #eee' : '3px solid #2e7d32',
                  }}
                  onClick={() => !notif.isRead && handleMarkOneRead(notif._id)}
                >
                  <div style={styles.notifIcon}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div style={styles.notifContent}>
                    <p style={styles.notifMessage}>{notif.message}</p>
                    <p style={styles.notifTime}>{getTimeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && <div style={styles.unreadDot} />}
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
  container: { position: 'relative' },
  bellBtn: {
    position: 'relative',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '0 5px',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#c62828',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '40px',
    width: '360px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f9fbe7',
  },
  dropdownTitle: {
    fontWeight: 'bold',
    color: '#2e7d32',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  unreadBadge: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
  },
  headerBtns: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  markReadBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #2e7d32',
    color: '#2e7d32',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  list: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 15px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  notifIcon: {
    fontSize: '20px',
    minWidth: '30px',
    textAlign: 'center',
  },
  notifContent: { flex: 1 },
  notifMessage: {
    color: '#333',
    fontSize: '13px',
    margin: '0 0 4px',
    lineHeight: '1.4',
  },
  notifTime: {
    color: '#999',
    fontSize: '11px',
    margin: 0,
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2e7d32',
    marginTop: '4px',
    minWidth: '8px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#888',
  },
  emptyHint: {
    fontSize: '12px',
    color: '#bbb',
    marginTop: '5px',
  },
};

export default NotificationBell;