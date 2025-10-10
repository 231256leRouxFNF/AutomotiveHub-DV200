import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import './UserProfile.css'; // Import the new CSS file
import { userService, authService, followService, socialService, listingService } from '../services/api';

const UserProfile = () => {
  const { id } = useParams(); // Get user ID from URL parameters
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState([]); // New state for user's posts
  const [userListings, setUserListings] = useState([]); // New state for user's listings
  const currentUser = authService.getCurrentUser();
  const isOwner = currentUser && parseInt(currentUser.id) === parseInt(id);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userProfile = await userService.getUserProfile(id);
        setProfile(userProfile);

        if (currentUser && currentUser.id !== parseInt(id)) {
          const followingStatus = await followService.isFollowing(id);
          setIsFollowing(followingStatus);
        }

        const followers = await followService.getFollowers(id);
        setFollowersCount(followers.length);

        const following = await followService.getFollowing(id);
        setFollowingCount(following.length);

        // Fetch user's posts
        const posts = await socialService.getPostsByUserId(id);
        setUserPosts(posts);

        // Fetch user's listings
        const listings = await listingService.getListingsByUserId(id);
        setUserListings(listings);

      } catch (error) {
        console.error('Error fetching profile data:', error);
        setProfile(null);
        setUserPosts([]);
        setUserListings([]);
      }
    };

    fetchProfileData();
  }, [id, currentUser, isFollowing]); // Re-run effect if id, currentUser, or isFollowing changes

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
          <img src={profile.avatar_url || 'https://i.pravatar.cc/150'} alt="Profile Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h1 className="profile-display-name">{profile.display_name || profile.username}</h1>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-bio">{profile.bio || 'No bio available.'}</p>
            <div className="profile-meta">
              <span>📍 {profile.location || 'Unknown Location'}</span>
              <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            <div className="profile-stats">
              <span><strong>{followersCount}</strong> Followers</span>
              <span><strong>{followingCount}</strong> Following</span>
            </div>
            <div className="profile-actions">
              {!isOwner && currentUser && (
                <button onClick={handleFollowToggle} className={`btn ${isFollowing ? 'secondary-btn' : 'primary-btn'}`}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              <Link to={`/garage/${profile.id}`} className="btn secondary-btn">View Garage</Link>
            </div>
          </div>
        </div>

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
                    <span className="post-timestamp-small">{new Date(post.created_at).toLocaleDateString()}</span>
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
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
