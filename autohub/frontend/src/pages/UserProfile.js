import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import './UserProfile.css'; // Import the new CSS file
import { userService, authService, followService, socialService, listingService, garageService } from '../services/api';
import FollowListModal from '../components/FollowListModal'; // Import the new modal component

const UserProfile = () => {
  const { id } = useParams(); // Get user ID from URL parameters
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState([]); // New state for user's posts
  const [userListings, setUserListings] = useState([]); // New state for user's listings
  const [userVehicles, setUserVehicles] = useState([]); // New state for user's vehicles
  const [showFollowModal, setShowFollowModal] = useState(false); // State to control modal visibility
  const [modalType, setModalType] = useState(''); // State to control modal content ('followers' or 'following')
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser ? parseInt(currentUser.id) : null; // Safely parse current user ID once
  const isOwner = currentUserId && parseInt(id) === currentUserId; // More robust owner check

  useEffect(() => {
    const profileIdToFetch = id || currentUserId;

    if (!profileIdToFetch) {
      // If no ID is available in the URL and no user is logged in, redirect to login.
      // This is a safeguard, as AuthWrapper should already handle this.
      navigate('/login', { replace: true });
      return;
    }

    // If the URL is generic '/profile', redirect to the specific user's profile URL.
    if (!id && currentUserId) {
      navigate(`/profile/${currentUserId}`, { replace: true });
      return;
    }

    const fetchProfileData = async () => {
      console.log(`[UserProfile] Fetching data for user ID: ${profileIdToFetch}`);
      try {
        const userProfile = await userService.getUserProfile(profileIdToFetch);
        setProfile(userProfile);

        if (currentUserId && currentUserId !== parseInt(profileIdToFetch)) {
          const followingStatus = await followService.isFollowing(profileIdToFetch);
          setIsFollowing(followingStatus);
        }

        const [followers, following, posts, listings, vehicles] = await Promise.all([
          followService.getFollowers(profileIdToFetch),
          followService.getFollowing(profileIdToFetch),
          socialService.getPostsByUserId(profileIdToFetch),
          listingService.getListingsByUserId(profileIdToFetch),
          garageService.getUserVehicles(profileIdToFetch)
        ]);

        setFollowersCount(followers.length);
        setFollowingCount(following.length);
        setUserPosts(posts);
        setUserListings(listings);
        setUserVehicles(vehicles);

      } catch (error) {
        console.error('[UserProfile] Error fetching profile data:', error);
        setProfile(null);
        setUserPosts([]);
        setUserListings([]);
        setUserVehicles([]);
      }
    };

    if (profileIdToFetch) {
      fetchProfileData();
    }
  }, [id, currentUserId, isFollowing, navigate]); // Re-run effect if id, currentUserId, or isFollowing changes

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentUser || !currentUser.id) {
      alert('Please log in to upload a profile photo.');
      navigate('/login');
      return;
    }

    try {
      const response = await userService.uploadProfileAvatar(currentUser.id, file);
      if (response.success) {
        setProfile(prevProfile => ({
          ...prevProfile,
          avatar_url: response.avatar_url,
        }));
        alert('Profile photo updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile photo.');
      }
    } catch (error) {
      console.error('Error uploading profile avatar:', error);
      alert(error.message || 'Failed to upload profile photo.');
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('Please log in to follow users.');
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await followService.unfollowUser(id);
        setIsFollowing(false);
        setFollowersCount(prevCount => prevCount - 1);
      } else {
        await followService.followUser(id);
        setIsFollowing(true);
        setFollowersCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      alert(error.message || 'Failed to update follow status.');
    }
  };

  const openFollowModal = (type) => {
    setModalType(type);
    setShowFollowModal(true);
  };

  const closeFollowModal = () => {
    setShowFollowModal(false);
    setModalType('');
  };

  if (!profile) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="page-container">
          <h1 className="page-title">User Profile</h1>
          <p className="text-center">Loading profile or profile not found...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <img src={profile.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile Avatar" className="profile-avatar" />
            {isOwner && (
              <label htmlFor="avatar-upload" className="avatar-upload-btn" title="Change profile photo">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <span>✏️</span>
              </label>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-display-name">{profile.display_name || profile.username}</h1>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-bio">{profile.bio || 'No bio available.'}</p>
            <div className="profile-meta">
              <span>📍 {profile.location || 'Unknown Location'}</span>
              <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            <div className="profile-stats">
              <span onClick={() => openFollowModal('followers')} className="clickable-stat"><strong>{followersCount}</strong> Followers</span>
              <span onClick={() => openFollowModal('following')} className="clickable-stat"><strong>{followingCount}</strong> Following</span>
            </div>
            <div className="profile-actions">
              {isOwner && (
                <Link to={`/profile/${id}/edit`} className="btn primary-btn">Edit Profile</Link>
              )}
              {!isOwner && currentUser && (
                <button onClick={handleFollowToggle} className={`btn ${isFollowing ? 'secondary-btn' : 'primary-btn'}`}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              <Link to={`/garage/${profile.id}`} className="btn secondary-btn">View Garage</Link>
              {!isOwner && currentUser && ( // Message button for other users
                <button onClick={() => navigate(`/messages?recipientId=${profile.id}`)} className="btn primary-btn">Message</button>
              )}
            </div>
          </div>
        </div>

        {/* New Section: User Activity Summary */}
        <section className="section user-activity-summary">
          <h2 className="section-title">Activity Summary</h2>
          <div className="activity-stats-grid">
            <div className="stat-card">
              <h3>{userPosts.length}</h3>
              <p>Posts</p>
            </div>
            <div className="stat-card">
              <h3>{userListings.length}</h3>
              <p>Listings</p>
            </div>
            <div className="stat-card">
              <h3>{userVehicles.length}</h3>
              <p>Vehicles in Garage</p>
            </div>
            {/* Add more stats as needed */}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Recent Posts</h2>
          <div className="section-content grid posts-grid">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <div key={post.id} className="post-card-small">
                  {post.images && post.images.length > 0 && (
                    <img src={post.images[0]} alt="Post" className="post-image-small" />
                  )}
                  <div className="post-content-small">
                    <p className="post-text-small">{post.content}</p>
                    <span className="post-timestamp-small">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Recent Listings</h2>
          <div className="section-content grid listings-grid">
            {userListings.length > 0 ? (
              userListings.map(listing => (
                <div key={listing.id} className="listing-card-small">
                  {listing.imageUrls && JSON.parse(listing.imageUrls).length > 0 && (
                    <img src={JSON.parse(listing.imageUrls)[0]} alt="Listing" className="listing-image-small" />
                  )}
                  <div className="listing-content-small">
                    <h3 className="listing-title-small">{listing.title}</h3>
                    <p className="listing-price-small">R {parseFloat(listing.price).toFixed(2)}</p>
                    <span className="listing-location-small">📍 {listing.location}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No listings yet.</p>
            )}
          </div>
        </section>

        {/* New Section: User Vehicles (Garage Overview) */}
        <section className="section">
          <h2 className="section-title">My Garage Overview</h2>
          <div className="section-content grid vehicles-grid">
            {userVehicles.length > 0 ? (
              userVehicles.map(vehicle => {
                let imageUrl = null;
                try {
                  // Assuming vehicle.image_url is a string that might be JSON or a direct URL
                  if (vehicle.image_url && vehicle.image_url.startsWith('[')) {
                    const parsedImages = JSON.parse(vehicle.image_url);
                    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                      imageUrl = parsedImages[0];
                    }
                  } else if (vehicle.image_url) {
                    imageUrl = vehicle.image_url;
                  }
                } catch (e) {
                  console.error(`[UserProfile] Error parsing vehicle imageUrl for vehicle ${vehicle.id}:`, e);
                }

                return (
                  <div key={vehicle.id} className="vehicle-card-small">
                    {imageUrl && (
                      <img src={imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="vehicle-image-small" />
                    )}
                    <div className="vehicle-content-small">
                      <h3 className="vehicle-title-small">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                      <p className="vehicle-description-small">{vehicle.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No vehicles in garage yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
      {showFollowModal && (
        <FollowListModal
          userId={id}
          type={modalType}
          onClose={closeFollowModal}
        />
      )}
    </div>
  );
};

export default UserProfile;
