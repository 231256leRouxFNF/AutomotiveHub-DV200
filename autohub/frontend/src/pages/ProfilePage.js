

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
          // Fetch public profile by ID. Backend may return the user object directly
          // or a wrapped object. Normalize both shapes below.
          const response = await fetch(`/api/user/${id}/profile`);
          const data = await response.json();
          // If backend returned { success: true, user: {...} } use data.user,
          // otherwise assume response is the user object itself.
          user = data && data.user ? data.user : data;
        } else {
          // Fetch current user's profile. userService.getProfile() returns
          // response.data which may be { success: true, user: {...} }.
          const profileResp = await userService.getProfile();
          user = profileResp && profileResp.user ? profileResp.user : profileResp;
        }
        // Final safety: if still wrapped under `data` key, unwrap.
        if (user && user.data && user.data.user) {
          user = user.data.user;
        }
        setProfile(user);

        // Fetch vehicles and posts in parallel to reduce wait time
        const [userVehicles, postsResp] = await Promise.all([
          user ? garageService.getUserVehicles(user.id) : [],
          socialService.getPosts()
        ]);
        setVehicles(userVehicles || []);

        const response = postsResp;
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
        console.error('Error fetching profile page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // If fetch finished and no profile, show not found
  if (!profile && !loading) return <div>Profile not found.</div>;

  // Show DM button if viewing another user's profile
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = !id || (currentUser && currentUser.id === (profile && profile.id));

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img className="profile-avatar" src={profile?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=667eea&color=fff&size=128`} alt="avatar" />
        <div className="profile-userinfo">
          <div className="profile-username">
            <h2>{profile?.username || (loading ? 'Loading…' : 'Unknown')}</h2>
            <div className="profile-actions">
              {isOwnProfile ? (
                <button onClick={() => navigate('/settings')}>Edit Profile</button>
              ) : (
                <button onClick={() => setDmOpen(true)}>Message</button>
              )}
            </div>
          </div>
          <div className="profile-stats-list">
            <span>{posts.length} posts</span>
            <span>{profile?.followers || 0} followers</span>
            <span>{profile?.following || 0} following</span>
          </div>
          <div className="profile-bio">
            <div style={{ fontWeight: 600 }}>{profile?.display_name || ''}</div>
            <div>{profile?.bio || profile?.email || ''}</div>
          </div>
        </div>
      </div>

      <h2 style={{ color: '#2457d6', fontWeight: 700, marginTop: 8 }}>Garage</h2>
      <ul>
        {vehicles.length === 0 ? <li style={{ background: '#f7f7f7', borderRadius: 6, padding: '10px 16px', color: '#2457d6', fontWeight: 600 }}>{loading ? 'Loading vehicles...' : 'No vehicles in garage.'}</li> : vehicles.map(v => (
          <li key={v.id} style={{ background: '#f7f7f7', borderRadius: 6, padding: '10px 16px', marginBottom: 8 }}>{v.make} {v.model} ({v.year})</li>
        ))}
      </ul>

      <h2 style={{ color: '#2457d6', fontWeight: 700, marginTop: 20 }}>Posts</h2>
      {posts.length === 0 ? (
        <div style={{ background: '#f7f7f7', borderRadius: 6, padding: '10px 16px', color: '#2457d6', fontWeight: 600 }}>{loading ? 'Loading posts...' : 'No posts yet.'}</div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-item" onClick={() => setZoomedImage(post.image || post.image_url)}>
              <img src={post.image || post.image_url} alt={`post-${post.id}`} />
            </div>
          ))}
        </div>
      )}
      <ImageModal src={zoomedImage} alt="Post" onClose={() => setZoomedImage(null)} />

      <Modal open={dmOpen} onClose={() => setDmOpen(false)}>
        <h2>Send a Message to {profile?.username || ''}</h2>
        <textarea value={dmText} onChange={e => setDmText(e.target.value)} rows={4} style={{ width: '100%', marginBottom: 8 }} placeholder="Type your message..." />
        <button style={{ background: '#2457d6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setDmOpen(false); setDmText(''); alert('Message sent (demo only)!'); }}>Send</button>
      </Modal>
    </div>
  );
};

export default ProfilePage;
