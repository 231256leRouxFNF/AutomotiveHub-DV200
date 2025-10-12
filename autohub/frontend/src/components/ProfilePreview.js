import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/api';
import './ProfilePreview.css';

const ProfilePreview = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const config = currentUser ? { headers: { Authorization: `Bearer ${currentUser.token}` } } : {};
        const response = await axios.get(`/api/users/${userId}/profile`, config);
        setProfile(response.data);
        setIsFollowing(response.data.isFollowing);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      alert('You need to be logged in to follow users.');
      return;
    }

    try {
      if (isFollowing) {
        await axios.post('/api/follows/unfollow', { followeeId: userId }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        await axios.post('/api/follows/follow', { followeeId: userId }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      alert('Failed to update follow status.');
    }
  };

  if (loading) return <div className="profile-preview-card">Loading profile...</div>;
  if (error) return <div className="profile-preview-card">Error: {error.message}</div>;
  if (!profile) return <div className="profile-preview-card">No profile found.</div>;

  const { display_name, avatar_url, bio, followersCount, followingCount, mutualFollowers } = profile;

  // Check if the current user is viewing their own profile
  const currentUser = authService.getCurrentUser();
  const isOwnProfile = currentUser && currentUser.id === userId;

  return (
    <div className="profile-preview-card">
      <img src={avatar_url || '/images/no-image.svg'} alt={display_name || profile.username} className="profile-avatar" />
      <Link to={`/profile/${userId}`} className="profile-name">{display_name || profile.username}</Link>
      <p className="profile-bio">{bio}</p>
      <div className="profile-stats">
        <span>{followersCount} Followers</span>
        <span>{followingCount} Following</span>
      </div>

      {!isOwnProfile && (
        <div className="profile-actions">
          <button onClick={handleFollowToggle} className={isFollowing ? 'unfollow-button' : 'follow-button'}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
          <button className="message-button">Message</button>
        </div>
      )}

      {mutualFollowers && mutualFollowers.length > 0 && (
        <div className="mutual-followers">
          <p>Mutual followers:</p>
          <ul>
            {mutualFollowers.map(mutual => (
              <li key={mutual.id}>
                <Link to={`/profile/${mutual.id}`}>{mutual.display_name || mutual.username}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfilePreview;
