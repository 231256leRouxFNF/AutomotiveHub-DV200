import React from 'react';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import { authService, userService, garageService } from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalVehicles: 0, featured: 0, upcomingEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = authService.getCurrentUser();
        if (!me) {
          setProfile({
            display_name: 'Guest',
            username: 'guest',
            email: '',
            bio: 'Sign in to personalize your profile.',
            location: '',
            avatar_url: ''
          });
          setLoading(false);
          return;
        }

        let p = null;
        try {
          p = await userService.getUserProfile(me.id);
        } catch (e) {
          p = {
            display_name: me.username || 'User',
            username: me.username || 'user',
            email: me.email || '',
            bio: '',
            location: '',
            avatar_url: ''
          };
        }
        setProfile(p);

        try {
          const s = await garageService.getGarageStats(me.id);
          setStats({
            totalVehicles: Number(s.totalVehicles || 0),
            featured: Number(s.featured || 0),
            upcomingEvents: Number(s.upcomingEvents || 0)
          });
        } catch {
          setStats({ totalVehicles: 0, featured: 0, upcomingEvents: 0 });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <h1 className="profile-title">My Profile</h1>

        <div className="stats-row">
          <StatCard icon={<span>🚗</span>} number={String(stats.totalVehicles)} label="Total Vehicles" />
          <StatCard icon={<span>⭐</span>} number={String(stats.featured)} label="Featured" />
          <StatCard icon={<span>📅</span>} number={String(stats.upcomingEvents)} label="Upcoming Events" />
        </div>

        <div className="profile-grid">
          <aside className="profile-card">
            <div className="profile-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <span>👤</span>
              )}
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

            <h3 className="section-title" style={{ marginTop: 24 }}>Preferences</h3>
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

        {loading && <div className="muted" style={{ marginTop: 16 }}>Loading profile…</div>}
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
