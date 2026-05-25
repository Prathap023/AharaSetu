import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

function MyListings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [listingRatings, setListingRatings] = useState({
    data: {},
    average: null,
    total: 0
  });

  const [activeTab, setActiveTab] = useState('all');

  // =========================
  // USE EFFECT
  // =========================
  useEffect(() => {
    // Wait until user loads
    if (!user) return;

    // Redirect if not restaurant
    if (user.role !== 'restaurant') {
      navigate('/login');
      return;
    }

    fetchListings();
    fetchAllRatings();

    const interval = setInterval(() => {
      fetchListings();
      fetchAllRatings();
    }, 5000);

    return () => clearInterval(interval);

  }, [user, token]);

  // =========================
  // FETCH LISTINGS
  // =========================
  const fetchListings = async () => {
    try {
      const res = await axios.get(
        'https://aharasetu-backend-pov2.onrender.com/api/food/my-listings',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setListings(
        res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );

    } catch (err) {
      console.error('Fetch listings error:', err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH RATINGS
  // =========================
  const fetchAllRatings = async () => {
    try {
      // Prevent undefined ID issue
      if (!user || (!user._id && !user.id)) {
        console.log('User ID not available yet');
        return;
      }

      const userId = user._id || user.id;

      const res = await axios.get(
        `https://aharasetu-backend-pov2.onrender.com/api/ratings/restaurant/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = {};

      res.data.ratings.forEach((r) => {
        if (r.foodListing?._id) {
          data[r.foodListing._id] = r;
        }
      });

      setListingRatings({
        data,
        average: res.data.average,
        total: res.data.total,
      });

    } catch (err) {
      console.error('Fetch ratings frontend error:', err);
    }
  };

  // =========================
  // APPROVE CLAIM
  // =========================
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `https://aharasetu-backend-pov2.onrender.com/api/food/approve-claim/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Claim approved!');
      fetchListings();

    } catch (err) {
      console.error(err);
      setMessage('❌ Something went wrong!');
    }
  };

  // =========================
  // REJECT CLAIM
  // =========================
  const handleReject = async (id) => {
    try {
      await axios.put(
        `https://aharasetu-backend-pov2.onrender.com/api/food/reject-claim/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Claim rejected and payment refunded!');
      fetchListings();

    } catch (err) {
      console.error(err);
      setMessage('❌ Something went wrong!');
    }
  };

  // =========================
  // PROVIDED FOOD
  // =========================
  const handleProvided = async (id) => {
    try {
      await axios.put(
        `https://aharasetu-backend-pov2.onrender.com/api/food/restaurant-provided/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Marked as provided!');
      fetchListings();

    } catch (err) {
      console.error(err);
      setMessage('❌ Something went wrong!');
    }
  };

  // =========================
  // ACK STATUS
  // =========================
  const getAckStatus = (item) => {
    if (
      item.status !== 'claimed' &&
      item.status !== 'completed'
    ) return null;

    if (item.adminCompleted) {
      return {
        text: '🎉 Transaction Completed!',
        color: '#16A34A',
        bg: '#F0FDF4',
      };
    }

    if (
      item.restaurantProvided &&
      !item.volunteerPickedUp
    ) {
      return {
        text: '✅ You provided — waiting for volunteer to pick up',
        color: '#D97706',
        bg: '#FFFBEB',
      };
    }

    if (
      !item.restaurantProvided &&
      item.volunteerPickedUp
    ) {
      return {
        text: '⚠️ Volunteer picked up — please acknowledge!',
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    }

    if (
      item.restaurantProvided &&
      item.volunteerPickedUp
    ) {
      return {
        text: '✅ Both acknowledged — waiting for admin',
        color: '#2563EB',
        bg: '#EFF6FF',
      };
    }

    return {
      text: '⏳ Waiting for acknowledgements',
      color: '#6B7280',
      bg: '#F9FAFB',
    };
  };

  // =========================
  // STATUS BADGE
  // =========================
  const getStatusBadge = (item) => {
    if (!item.adminApproved && !item.adminRejected) {
      return {
        label: '⏳ Pending Review',
        color: '#D97706',
        bg: '#FFFBEB',
      };
    }

    if (item.adminRejected) {
      return {
        label: '❌ Rejected',
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    }

    if (item.status === 'completed') {
      return {
        label: '🎉 Completed',
        color: '#16A34A',
        bg: '#F0FDF4',
      };
    }

    if (item.status === 'available') {
      return {
        label: '✅ Live',
        color: '#16A34A',
        bg: '#F0FDF4',
      };
    }

    if (item.status === 'pending_payment') {
      return {
        label: '💳 Awaiting Payment',
        color: '#7C3AED',
        bg: '#FAF5FF',
      };
    }

    if (item.status === 'pending_restaurant_approval') {
      return {
        label: '🔔 Action Required',
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    }

    if (item.status === 'claimed') {
      return {
        label: '📦 Claimed',
        color: '#2563EB',
        bg: '#EFF6FF',
      };
    }

    return {
      label: item.status,
      color: '#6B7280',
      bg: '#F9FAFB',
    };
  };

  // =========================
  // TABS
  // =========================
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Live' },
    { key: 'pending_restaurant_approval', label: 'Action Needed' },
    { key: 'claimed', label: 'Claimed' },
    { key: 'completed', label: 'Completed' },
  ];

  // =========================
  // FILTERED LIST
  // =========================
  const filtered =
    activeTab === 'all'
      ? listings
      : listings.filter((l) => l.status === activeTab);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  // =========================
  // RETURN
  // =========================
  return (
    <div>
      <h1>My Listings</h1>

      {listingRatings.average && (
        <div>
          <h3>
            ⭐ Restaurant Rating: {listingRatings.average}
          </h3>

          <p>
            Based on {listingRatings.total} completed transactions
          </p>
        </div>
      )}

      <div>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && <p>{message}</p>}

      {filtered.map((item) => {
        const badge = getStatusBadge(item);
        const ack = getAckStatus(item);
        const itemRating = listingRatings.data?.[item._id];

        return (
          <div
            key={item._id}
            style={{
              border: '1px solid #ccc',
              marginBottom: '20px',
              padding: '20px',
              borderRadius: '10px',
            }}
          >
            <h3>{item.title}</h3>

            <p>{badge.label}</p>

            <p>Quantity: {item.quantity}</p>

            <p>
              {item.type === 'free'
                ? 'Free'
                : `₹${item.price}`}
            </p>

            <p>
              Expiry:
              {' '}
              {new Date(item.expiryTime).toLocaleDateString()}
            </p>

            <p>Listing ID: {item._id}</p>

            {item.claimedBy && (
              <div>
                <p>
                  Claimed by:
                  {' '}
                  {item.claimedBy.name}
                </p>

                <p>{item.claimedBy.email}</p>

                {item.claimedBy.phone && (
                  <p>{item.claimedBy.phone}</p>
                )}
              </div>
            )}

            {item.status === 'pending_restaurant_approval' && (
              <div>
                <button
                  onClick={() => handleApprove(item._id)}
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(item._id)}
                >
                  Reject
                </button>
              </div>
            )}

            {ack && (
              <div>
                <p>{ack.text}</p>
              </div>
            )}

            {item.status === 'claimed' &&
              !item.restaurantProvided && (
                <button
                  onClick={() => handleProvided(item._id)}
                >
                  I Have Provided the Food
                </button>
              )}

            {item.status === 'claimed' &&
              item.restaurantProvided && (
                <p>
                  ✅ You acknowledged providing the food
                </p>
              )}

            {item.status === 'completed' &&
              itemRating && (
                <div>
                  <h4>⭐ Rating Received</h4>

                  <StarRating
                    value={itemRating.stars}
                    readOnly
                    size="16px"
                  />

                  <p>
                    by {itemRating.volunteer?.name}
                  </p>

                  {itemRating.comment && (
                    <p>
                      "{itemRating.comment}"
                    </p>
                  )}
                </div>
              )}

            {item.status === 'completed' &&
              !itemRating && (
                <p>⏳ No rating received yet</p>
              )}

            <button
              onClick={() =>
                navigate('/report', {
                  state: {
                    listingId: item._id,
                    title: item.title,
                  },
                })
              }
            >
              🚨 Report Issue
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default MyListings;