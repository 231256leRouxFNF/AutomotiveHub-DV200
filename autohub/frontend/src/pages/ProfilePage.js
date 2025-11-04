import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
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
        // Fetch vehicles and posts for the user (stubbed)
        const userVehicles = user?.vehicles || [];
        const userPosts = user?.posts || [];
        setVehicles(userVehicles);
        setPosts(userPosts);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    try {
      await userService.uploadAvatar(avatarFile);
      alert('Profile picture updated!');
      setAvatarFile(null);
      setAvatarPreview(null);
      // Refresh profile
      const user = await userService.getProfile();
      setProfile(user);
    } catch (error) {
      alert('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="profile-page">
      <h1>{profile.username}'s Profile</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div>
          <img
            src={avatarPreview || profile.avatar || '/default-avatar.png'}
            alt="Avatar"
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
          />
        </div>
        <div>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
          {avatarPreview && (
            <button onClick={handleAvatarUpload} disabled={avatarUploading} style={{ marginLeft: 8 }}>
              {avatarUploading ? 'Uploading...' : 'Save Profile Picture'}
            </button>
          )}
        </div>
      </div>
      <div className="profile-stats">
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Posts:</strong> {posts.length}</p>
        <p><strong>Vehicles:</strong> {vehicles.length}</p>
      </div>
      <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
      <h2>Garage</h2>
      <ul>
        {vehicles.length === 0 ? <li>No vehicles in garage.</li> : vehicles.map(v => (
          <li key={v.id}>{v.make} {v.model} ({v.year})</li>
        ))}
      </ul>
      <h2>Posts</h2>
      <ul>
        {posts.length === 0 ? <li>No posts yet.</li> : posts.map(p => (
          <li key={p.id}>{p.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;
