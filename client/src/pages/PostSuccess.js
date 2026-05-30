import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PostSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const listing = state?.listing;

  // If no listing data redirect to dashboard
  if (!listing) {
    navigate('/dashboard');
    return null;
  }

  const details = [
    { label: 'Listing ID', value: listing._id, mono: true },
    { label: 'Food Title', value: listing.title },
    { label: 'Type', value: listing.type === 'free' ? 'Free' : 'Paid' },
    { label: 'Quantity', value: `${listing.quantityNumber} ${listing.quantityUnit}` },
    {
      label: 'Price',
      value: listing.type === 'paid'
        ? `₹${listing.pricePerUnit} per ${listing.quantityUnit === 'kg' ? 'kg' : 'plate'} (Total: ₹${listing.pricePerUnit * listing.quantityNumber})`
        : 'Free'
    },
    { label: 'Expiry', value: new Date(listing.expiryTime).toLocaleString() },
    { label: 'Address', value: listing.address },
    { label: 'Phone', value: listing.phone },
    { label: 'Contact Email', value: listing.contactEmail },
    { label: 'Status', value: 'Pending Admin Review' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Success Header */}
        <div style={styles.successHeader}>
          <div style={styles.checkCircle}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#FF5200" />
              <path d="M12 20L17 25L28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={styles.successTitle}>Listing Submitted!</h1>
          <p style={styles.successSub}>
            Your food listing has been submitted successfully. Admin will review and approve it shortly — you'll be notified once it goes live.
          </p>
        </div>

        {/* Listing Details Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Listing Details</h2>
            <span style={styles.statusBadge}>Pending Review</span>
          </div>

          <div style={styles.detailsList}>
            {details.map((d, i) => (
              <div key={i} style={styles.detailRow}>
                <span style={styles.detailLabel}>{d.label}</span>
                <span style={{
                  ...styles.detailValue,
                  ...(d.mono ? styles.detailMono : {}),
                  ...(d.label === 'Status' ? styles.detailStatus : {}),
                  ...(d.label === 'Type' && listing.type === 'free' ? styles.detailFree : {}),
                  ...(d.label === 'Type' && listing.type === 'paid' ? styles.detailPaid : {}),
                }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Admin will review your listing before it goes live. You'll receive a notification once it's approved or if it gets rejected with a reason.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            style={styles.secondaryBtn}
            onClick={() => navigate('/my-listings')}
          >
            View My Listings
          </button>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate('/dashboard')}
          >
            Post Another Listing
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FAFAFA',
    paddingTop: '64px',
  },
  wrap: {
    maxWidth: '620px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  successHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  checkCircle: {
    display: 'inline-flex',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 16px rgba(255,82,0,0.35))',
  },
  successTitle: {
    fontSize: '1.9rem',
    fontWeight: '800',
    color: '#1C1C1C',
    letterSpacing: '-0.03em',
    marginBottom: '10px',
  },
  successSub: {
    fontSize: '0.92rem',
    color: '#6B7280',
    lineHeight: 1.7,
    maxWidth: '460px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    border: '1px solid #F0F0F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    marginBottom: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    borderBottom: '1px solid #F3F4F6',
    background: '#FAFAFA',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: '-0.01em',
  },
  statusBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    background: '#FFFBEB',
    color: '#D97706',
    border: '1px solid #FDE68A',
  },
  detailsList: {
    padding: '8px 0',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 22px',
    borderBottom: '1px solid #F9FAFB',
    gap: '16px',
  },
  detailLabel: {
    fontSize: '0.82rem',
    color: '#9CA3AF',
    fontWeight: '500',
    flexShrink: 0,
    minWidth: '120px',
  },
  detailValue: {
    fontSize: '0.88rem',
    color: '#1C1C1C',
    fontWeight: '500',
    textAlign: 'right',
    wordBreak: 'break-all',
  },
  detailMono: {
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    color: '#374151',
    background: '#F3F4F6',
    padding: '2px 8px',
    borderRadius: '5px',
  },
  detailStatus: {
    color: '#D97706',
    background: '#FFFBEB',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '0.76rem',
    fontWeight: '700',
    border: '1px solid #FDE68A',
  },
  detailFree: {
    color: '#16A34A',
    background: '#F0FDF4',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '0.76rem',
    fontWeight: '700',
    border: '1px solid #BBF7D0',
  },
  detailPaid: {
    color: '#FF5200',
    background: '#FFF0EB',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '0.76rem',
    fontWeight: '700',
    border: '1px solid rgba(255,82,0,0.2)',
  },
  infoBox: {
    background: '#FFF8F5',
    border: '1px solid rgba(255,82,0,0.15)',
    borderLeft: '3px solid #FF5200',
    borderRadius: '8px',
    padding: '14px 16px',
    marginBottom: '24px',
  },
  infoText: {
    fontSize: '0.83rem',
    color: '#6B7280',
    lineHeight: 1.65,
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  secondaryBtn: {
    flex: 1,
    padding: '13px',
    background: 'white',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
  },
  primaryBtn: {
    flex: 1,
    padding: '13px',
    background: 'linear-gradient(135deg, #FF5200, #FF6B35)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.92rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255,82,0,0.3)',
  },
};

export default PostSuccess;