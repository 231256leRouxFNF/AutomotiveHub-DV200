import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import { authService, userService, garageService } from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [stats, setStats] = useState({ totalVehicles: 0, featured: 0, upcomingEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = authService.getCurrentUser();
        console.log('Current User:', me); // Debugging current user

        // If not logged in, show guest fallback
        if (!me) {
          setProfile({
            display_name: 'Guest',
            username: 'guest',
            email: '',
            bio: 'Sign in to personalize your profile.',
            location: '',
            profile_image: null
          });
          setProfileError(null);
          return;
        }

        const res = await userService.getProfile();
        console.log('Profile Response:', res); // Debugging profile response

        if (res && res.success && res.profile) {
          setProfile(res.profile);
          setProfileError(null);
        } else {
          setProfileError('Profile not found');
          setProfile(null);
        }

        try {
          const s = await garageService.getGarageStats?.(me.id);
          console.log('Garage Stats:', s); // Debugging garage stats
          setStats({
            totalVehicles: Number(s?.totalVehicles || 0),
            featured: Number(s?.featured || 0),
            upcomingEvents: Number(s?.upcomingEvents || 0)
          });
        } catch (err) {
          console.error('Garage Stats Error:', err); // Debugging garage stats error
          setStats({ totalVehicles: 0, featured: 0, upcomingEvents: 0 });
        }
      } catch (err) {
        console.error('Profile Load Error:', err); // Debugging profile load error
        setProfileError('Failed loading profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      if (res && res.success && res.profile_image) {
        setProfile((p) => ({ ...(p || {}), profile_image: res.profile_image }));
      }
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (profileError) return <p style={{ color: 'red' }}>Error: {profileError}</p>;

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-grid">
          <aside className="profile-card">
            <div className="profile-avatar">
              {profile?.profile_image ? (
                <img src={profile.profile_image} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <span>👤</span>
              )}
              <div style={{ marginTop: 8 }}>
                <label htmlFor="avatar-upload" className="edit-profile-btn" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : 'Change Avatar'}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <h2 className="profile-name">{profile?.display_name || 'Unnamed'}</h2>
            <div className="profile-username">@{profile?.username || 'user'}</div>
            {profile?.bio && <p className="profile-bio">{profile.bio}</p>}

            <div className="profile-meta">
              <div className="meta-item">
                <div className="meta-label">Email</div>
                <div className="meta-value">{profile?.email || '—'}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Location</div>
                <div className="meta-value">{profile?.location || '—'}</div>
              </div>
            </div>

            <button className="edit-profile-btn" type="button">Edit Profile</button>
          </aside>

          <section className="profile-section">
            <h3 className="section-title">Account Information</h3>
            <div className="section-grid">
              <div className="info-card">
                <div className="info-label">Display Name</div>
                <div className="info-value">{profile?.display_name || '—'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Username</div>
                <div className="info-value">{profile?.username || '—'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Email</div>
                <div className="info-value">{profile?.email || '—'}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Location</div>
                <div className="info-value">{profile?.location || '—'}</div>
              </div>
            </div>

            <h3 className="section-title mt-24">Preferences</h3>
            <div className="section-grid">
              <div className="info-card">
                <div className="info-label">Language</div>
                <div className="info-value">English</div>
              </div>
              <div className="info-card">
                <div className="info-label">Region</div>
                <div className="info-value">Global</div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
