import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/api'; // Corrected import
import './EditProfilePage.css';

const EditProfilePage = () => {
  const { id } = useParams(); // Get user ID from URL parameters
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    display_name: '',
    bio: '',
    location: '',
    avatar_url: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser ? currentUser.id : null;

  useEffect(() => {
    if (!currentUserId || parseInt(currentUserId) !== parseInt(id)) {
      navigate('/login'); // Redirect if not authorized or not logged in
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = authService.getToken();
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`/api/users/${id}/profile`, config);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUserId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    setSelectedAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = authService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Update text fields
      await axios.put(`/api/users/${id}/profile`, {
        display_name: profile.display_name,
        bio: profile.bio,
        location: profile.location
      }, config);

      // Update avatar if selected
      if (selectedAvatar) {
        const formData = new FormData();
        formData.append('avatar', selectedAvatar);
        await axios.post(`/api/users/${id}/profile/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
      }

      alert('Profile updated successfully!');
      navigate(`/profile/${id}`); // Redirect to updated profile
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile.');
    }
  };

  if (loading) {
    return <div className="edit-profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="edit-profile-container error">{error}</div>;
  }

  return (
    <div className="edit-profile-container">
      <h2>Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label htmlFor="display_name">Display Name:</label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={profile.display_name || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio || ''}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={profile.location || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-group avatar-upload-group">
          <label htmlFor="avatar">Profile Picture:</label>
          <div className="avatar-preview">
            {profile.avatar_url && (
              <img src={profile.avatar_url} alt="Current Avatar" className="current-avatar" />
            )}
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <button type="submit" className="save-profile-button">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfilePage;
