

import React, { useEffect, useState } from 'react';
import { userService, garageService, socialService } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import ImageModal from '../components/ImageModal';
import './ProfilePage.css';

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, maxWidth: 400, margin: '100px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        {children}
        <button style={{ marginTop: 16 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmText, setDmText] = useState('');
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

        // Fetch posts for this user (from socialService, like CommunityFeed)
        const response = await socialService.getPosts();
        const realPosts = Array.isArray(response) ? response : (response.posts || []);
        // Filter and process posts for this user
        const userPosts = realPosts.filter(post => post.userId === user.id || post.user_id === user.id).map(post => ({
          id: post.id,
          username: post.username || post.user_username || 'Anonymous',
          profile_image: post.profile_image || post.user_profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username || 'User')}&background=667eea&color=fff&size=48`,
          content: post.content || post.title || '',
          image: post.image_url || post.image || null,
          created_at: post.created_at
        }));
        setPosts(userPosts);
      } catch (error) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#2457d6', margin: 0 }}>{profile.username}'s Profile</h1>
        {!isOwnProfile && (
          <button className="dm-btn" style={{ background: '#2457d6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setDmOpen(true)}>
            Send Message
          </button>
        )}
      </div>
      <div className="profile-stats" style={{ display: 'flex', gap: '32px', marginBottom: 24 }}>
        <span style={{ background: '#2457d6', color: '#fff', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}>Email: {profile.email}</span>
        <span style={{ background: '#2457d6', color: '#fff', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}>Posts: {posts.length}</span>
        <span style={{ background: '#2457d6', color: '#fff', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}>Vehicles: {vehicles.length}</span>
      </div>
      <h2 style={{ color: '#2457d6', fontWeight: 700 }}>Garage</h2>
      <ul>
        {vehicles.length === 0 ? <li style={{ background: '#f7f7f7', borderRadius: 6, padding: '10px 16px', color: '#2457d6', fontWeight: 600 }}>No vehicles in garage.</li> : vehicles.map(v => (
          <li key={v.id} style={{ background: '#f7f7f7', borderRadius: 6, padding: '10px 16px', marginBottom: 8 }}>{v.make} {v.model} ({v.year})</li>
        ))}
      </ul>
      <h2 style={{ color: '#2457d6', fontWeight: 700 }}>Posts</h2>
      <div>
        {posts.length === 0 ? (
          <div style={{ background: '#f7f7f7', borderRadius: 6, padding: '10px 16px', color: '#2457d6', fontWeight: 600 }}>No posts yet.</div>
        ) : (
          posts.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: 18, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={post.profile_image} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                <span style={{ fontWeight: 600, color: '#2457d6' }}>{post.username}</span>
                <span style={{ color: '#888', fontSize: 13 }}>{post.created_at}</span>
              </div>
              <div style={{ marginTop: 10, marginBottom: 10 }}>{post.content}</div>
              {post.image && (
                <img src={post.image} alt="post" style={{ maxWidth: '100%', borderRadius: 8, cursor: 'pointer' }} onClick={() => setZoomedImage(post.image)} />
              )}
            </div>
          ))
        )}
        <ImageModal src={zoomedImage} alt="Post" onClose={() => setZoomedImage(null)} />
      </div>

      <Modal open={dmOpen} onClose={() => setDmOpen(false)}>
        <h2>Send a Message to {profile.username}</h2>
        <textarea value={dmText} onChange={e => setDmText(e.target.value)} rows={4} style={{ width: '100%', marginBottom: 8 }} placeholder="Type your message..." />
        <button style={{ background: '#2457d6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setDmOpen(false); setDmText(''); alert('Message sent (demo only)!'); }}>Send</button>
      </Modal>
    </div>
  );
};

export default ProfilePage;
