import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'https://aharasetu-backend-pov2.onrender.com';

function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleRequest, setRoleRequest] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({ requestedRole: '', reason: '' });
  const [roleMsg, setRoleMsg] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
    fetchRoleRequest();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/profile/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
      setStats(res.data.stats);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchRoleRequest = async () => {
    try {
      const res = await axios.get(`${API}/api/profile/role-request/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoleRequest(res.data);
    } catch (err) {}
  };

  const handleRoleRequest = async (e) => {
    e.preventDefault();
    setRoleLoading(true); setRoleMsg('');
    try {
      await axios.post(`${API}/api/profile/role-request`, roleForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoleMsg('success');
      setShowRoleForm(false);
      fetchRoleRequest();
    } catch (err) {
      setRoleMsg(err.response?.data?.message || 'Something went wrong');
    }
    setRoleLoading(false);
  };

  const roleOptions = [
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'ngo', label: 'NGO' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'user', label: 'Regular User' },
  ].filter(r => r.value !== profile?.role);

  const roleColors = {
    restaurant: { bg: '#FFF0EB', color: '#FF5200' },
    volunteer: { bg: '#EFF6FF', color: '#2563EB' },
    ngo: { bg: '#F0FDF4', color: '#16A34A' },
    admin: { bg: '#FAF5FF', color: '#7C3AED' },
    user: { bg: '#F9FAFB', color: '#6B7280' },
  };

  const roleStyle = roleColors[profile?.role] || roleColors.user;

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading profile...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>

        {/* Profile Hero */}
        <div style={styles.profileHero}>
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{profile?.name}</h1>
            <p style={styles.profileEmail}>{profile?.email}</p>
            <span style={{ ...styles.roleBadge, background: roleStyle.bg, color: roleStyle.color }}>
              {profile?.role}
            </span>
          </div>
          <div style={styles.profileMeta}>
            <p style={styles.joinedText}>
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {profile?.role !== 'restaurant' ? (
            <>
              <div style={styles.statCard}>
                <span style={styles.statNum}>{stats?.totalClaims || 0}</span>
                <span style={styles.statLbl}>Total Claims</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNum}>{stats?.completedClaims || 0}</span>
                <span style={styles.statLbl}>Completed</span>
              </div>
              <div style={{ ...styles.statCard, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <span style={{ ...styles.statNum, color: '#16A34A' }}>{stats?.freeClaims || 0}</span>
                <span style={styles.statLbl}>Free Food Claimed</span>
              </div>
              <div style={{ ...styles.statCard, background: '#FFF0EB', border: '1px solid rgba(255,82,0,0.2)' }}>
                <span style={{ ...styles.statNum, color: '#FF5200' }}>{stats?.paidClaims || 0}</span>
                <span style={styles.statLbl}>Paid Food Claimed</span>
              </div>
            </>
          ) : (
            <>
              <div style={styles.statCard}>
                <span style={styles.statNum}>{stats?.totalListings || 0}</span>
                <span style={styles.statLbl}>Total Posted</span>
              </div>
              <div style={{ ...styles.statCard, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <span style={{ ...styles.statNum, color: '#16A34A' }}>{stats?.completedListings || 0}</span>
                <span style={styles.statLbl}>Completed</span>
              </div>
            </>
          )}
        </div>

        {/* Role Change Request Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Role Change Request</h2>
              <p style={styles.sectionSub}>Request to change your account role. Admin will review and approve.</p>
            </div>
          </div>

          {/* Show existing request status */}
          {roleRequest && (
            <div style={{
              ...styles.requestBox,
              background: roleRequest.status === 'approved' ? '#F0FDF4'
                : roleRequest.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
              borderColor: roleRequest.status === 'approved' ? '#BBF7D0'
                : roleRequest.status === 'rejected' ? '#FECACA' : '#FDE68A',
            }}>
              <div style={styles.requestTop}>
                <div>
                  <p style={styles.requestLabel}>Request Status</p>
                  <p style={{
                    ...styles.requestStatus,
                    color: roleRequest.status === 'approved' ? '#16A34A'
                      : roleRequest.status === 'rejected' ? '#DC2626' : '#D97706'
                  }}>
                    {roleRequest.status === 'approved' ? 'Approved'
                      : roleRequest.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                  </p>
                </div>
                <div style={styles.requestDetails}>
                  <span style={styles.requestFrom}>{roleRequest.currentRole}</span>
                  <span style={styles.requestArrow}>→</span>
                  <span style={styles.requestTo}>{roleRequest.requestedRole}</span>
                </div>
              </div>
              {roleRequest.adminNote && (
                <p style={styles.adminNote}>Admin note: {roleRequest.adminNote}</p>
              )}
              <p style={styles.requestDate}>
                Submitted {new Date(roleRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Role change form */}
          {(!roleRequest || roleRequest.status !== 'pending') && (
            <>
              {!showRoleForm ? (
                <button style={styles.requestBtn} onClick={() => setShowRoleForm(true)}>
                  Request Role Change
                </button>
              ) : (
                <div style={styles.roleForm}>
                  {roleMsg === 'success' && (
                    <div style={styles.successMsg}>Request submitted! Admin will review shortly.</div>
                  )}
                  {roleMsg && roleMsg !== 'success' && (
                    <div style={styles.errorMsg}>{roleMsg}</div>
                  )}
                  <form onSubmit={handleRoleRequest} style={styles.form}>
                    <div style={styles.field}>
                      <label style={styles.label}>Requested Role</label>
                      <select
                        style={styles.input}
                        value={roleForm.requestedRole}
                        onChange={e => setRoleForm({ ...roleForm, requestedRole: e.target.value })}
                        required
                      >
                        <option value="">Select role</option>
                        {roleOptions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Reason for Request</label>
                      <textarea
                        style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                        placeholder="Explain why you want to change your role..."
                        value={roleForm.reason}
                        onChange={e => setRoleForm({ ...roleForm, reason: e.target.value })}
                        required
                      />
                    </div>
                    <div style={styles.formBtns}>
                      <button
                        type="button"
                        style={styles.cancelBtn}
                        onClick={() => setShowRoleForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ ...styles.submitBtn, opacity: roleLoading ? 0.75 : 1 }}
                        disabled={roleLoading}
                      >
                        {roleLoading ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Password Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Password & Security</h2>
              <p style={styles.sectionSub}>Reset your password via email verification.</p>
            </div>
          </div>
          <button
            style={styles.requestBtn}
            onClick={() => navigate('/forgot-password')}
          >
            Reset Password
          </button>
        </div>

        {/* Logout */}
        <div style={styles.section}>
          <button
            style={styles.logoutBtn}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FAFAFA', paddingTop: '64px' },
  wrap: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px' },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '64px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #F3F4F6', borderTop: '3px solid #FF5200', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#9CA3AF', fontSize: '0.9rem' },
  profileHero: { background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)', borderRadius: '16px', padding: '32px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  avatarWrap: { flexShrink: 0 },
  avatar: { width: '72px', height: '72px', borderRadius: '18px', background: 'linear-gradient(135deg, #FF5200, #FF8C00)', color: 'white', fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,82,0,0.35)' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '1.4rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' },
  profileEmail: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: '10px' },
  roleBadge: { display: 'inline-block', fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' },
  profileMeta: { textAlign: 'right' },
  joinedText: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' },
  statCard: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '12px', padding: '18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  statNum: { display: 'block', fontSize: '1.8rem', fontWeight: '800', color: '#FF5200', lineHeight: 1, marginBottom: '4px' },
  statLbl: { display: 'block', fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' },
  section: { background: 'white', border: '1px solid #F0F0F0', borderRadius: '14px', padding: '24px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  sectionHeader: { marginBottom: '16px' },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px', letterSpacing: '-0.01em' },
  sectionSub: { fontSize: '0.82rem', color: '#9CA3AF' },
  requestBox: { border: '1px solid', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px' },
  requestTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  requestLabel: { fontSize: '0.72rem', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' },
  requestStatus: { fontSize: '0.92rem', fontWeight: '700' },
  requestDetails: { display: 'flex', alignItems: 'center', gap: '8px' },
  requestFrom: { fontSize: '0.82rem', color: '#6B7280', background: '#F3F4F6', padding: '2px 10px', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize' },
  requestArrow: { color: '#9CA3AF', fontSize: '0.9rem' },
  requestTo: { fontSize: '0.82rem', color: '#FF5200', background: '#FFF0EB', padding: '2px 10px', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize' },
  adminNote: { fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic', marginTop: '6px' },
  requestDate: { fontSize: '0.72rem', color: '#9CA3AF', marginTop: '4px' },
  requestBtn: { padding: '10px 20px', background: 'white', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.88rem', fontWeight: '600', color: '#374151', cursor: 'pointer' },
  roleForm: { marginTop: '12px' },
  successMsg: { background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.84rem', color: '#16A34A', marginBottom: '14px', fontWeight: '500' },
  errorMsg: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '0.84rem', color: '#DC2626', marginBottom: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.92rem', color: '#1C1C1C', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' },
  formBtns: { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '11px', background: 'white', border: '1.5px solid #E5E7EB', borderRadius: '9px', fontSize: '0.88rem', color: '#6B7280', cursor: 'pointer', fontWeight: '500' },
  submitBtn: { flex: 2, padding: '11px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)', color: 'white', border: 'none', borderRadius: '9px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' },
  logoutBtn: { width: '100%', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', fontSize: '0.88rem', fontWeight: '600', color: '#DC2626', cursor: 'pointer' },
};

export default Profile;