

import React, { useEffect, useState } from 'react';
import { userService, garageService, listingService } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let user;
        if (id) {
          // Fetch public profile by ID
          const response = await fetch(`/api/user/${id}/profile`);
          const data = await response.json();
          user = data.success ? data.user : null;
        } else {
          // Fetch current user's profile
          user = await userService.getProfile();
        }
        setProfile(user);

        // Fetch vehicles for this user
        const userVehicles = user ? await garageService.getUserVehicles(user.id) : [];
        setVehicles(userVehicles);

        // Fetch posts for this user
        const allPosts = await listingService.getAllListings();
        const userPosts = allPosts.filter(p => p.userId === user.id);
        setPosts(userPosts);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  // Show DM button if viewing another user's profile
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = !id || (currentUser && currentUser.id === profile.id);

  return (
    <div className="profile-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>{profile.username}'s Profile</h1>
        {!isOwnProfile && (
          <button className="dm-btn" onClick={() => navigate(`/dm/${profile.id}`)}>
            Send Message
          </button>
        )}
      </div>
      <div className="profile-stats" style={{ display: 'flex', gap: '24px', marginBottom: 24 }}>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Posts:</strong> {posts.length}</p>
        <p><strong>Vehicles:</strong> {vehicles.length}</p>
      </div>
      <h2>Garage</h2>
      <ul>
        {vehicles.length === 0 ? <li>No vehicles in garage.</li> : vehicles.map(v => (
          <li key={v.id}>{v.make} {v.model} ({v.year})</li>
        ))}
      </ul>
      <h2>Posts</h2>
      <ul>
        {posts.length === 0 ? <li>No posts yet.</li> : posts.map(p => (
          <li key={p.id}>{p.title || p.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;
