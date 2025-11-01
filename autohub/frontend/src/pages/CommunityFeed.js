import React, { useState, useEffect } from 'react';
import api, { socialService, authService, eventService } from '../services/api'; // Import api and eventService
import Header from '../components/Header';
import communityData from '../data/community.json';
import { useNavigate } from 'react-router-dom';
import ProfilePreview from '../components/ProfilePreview';
import './CommunityFeed.css';

const CommunityFeed = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [communityStats, setCommunityStats] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [communitySnapshots, setCommunitySnapshots] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = authService.getCurrentUser?.();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📥 Fetching community feed data...');
        
        // ✅ USE eventService instead of axios directly
        const eventsList = await eventService.getAllEvents();
        console.log('✅ Events fetched:', eventsList);
        setEvents(eventsList);
        
        // Fetch posts
        const postsList = await socialService.getPosts();
        console.log('✅ Posts fetched:', postsList);
        setPosts(postsList);
        
      } catch (error) {
        console.error('❌ Error fetching community data:', error);
        setError(error.message);
        setEvents([]);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderIcon = (iconName) => {
    // Simple icon rendering - you can expand this
    const icons = {
      'message-square': '💬',
      'car': '🚗',
      'tag': '🏷️',
      'calendar': '📅',
      'sparkles': '✨',
      'award': '🏆',
      'heart': '❤️',
      'message': '💬',
      'share': '↗️',
      'more': '⋯'
    };
    return <span className="icon">{icons[iconName] || '•'}</span>;
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    console.log('Post feature coming soon');
    setNewPostContent('');
  };

  const handleLike = (postId) => {
    console.log('Like feature coming soon');
  };

  const handleEditPost = (postId, currentContent) => {
    setEditingPostId(postId);
    setEditContent(currentContent);
  };

  const handleDeletePost = (postId) => {
    console.log('Delete feature coming soon');
  };

  const handleAddComment = (postId, comment) => {
    console.log('Comment feature coming soon');
  };

  const sidebarLinks = [
    { label: 'All Discussions', icon: 'message-square', active: true },
    { label: 'Build Logs', icon: 'car' },
    { label: 'Marketplace Deals', icon: 'tag' },
    { label: 'Upcoming Events', icon: 'calendar' },
    { label: 'Tips & Tricks', icon: 'sparkles' },
    { label: 'Member Spotlight', icon: 'award' }
  ];

  if (isLoading) {
    return (
      <div className="community-feed">
        <Header />
        <div className="loading" style={{ padding: '2rem', textAlign: 'center' }}>
          Loading community feed...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-feed">
        <Header />
        <div className="error" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          Error loading community feed: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="community-feed" style={{ minHeight: '100vh', background: '#1a1a1a' }}>
      <Header />
      
      <div className="community-container" style={{ padding: '2rem', color: 'white' }}>
        {/* Sidebar */}
        <aside className="community-sidebar" style={{ background: '#2a2a2a', padding: '1rem' }}>
          <div className="sidebar-section">
            <h3 className="sidebar-title" style={{ color: 'white' }}>Explore Communities</h3>
            <nav className="sidebar-nav">
              {sidebarLinks.map((link, index) => (
                <button
                  key={index}
                  className={`sidebar-link ${link.active ? 'active' : ''}`}
                  style={{ color: 'white', padding: '0.5rem', display: 'block', width: '100%' }}
                >
                  {renderIcon(link.icon)}
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Upcoming Events */}
          {events && events.length > 0 && (
            <div className="sidebar-section" style={{ marginTop: '1rem' }}>
              <h3 className="sidebar-title" style={{ color: 'white' }}>Upcoming Events ({events.length})</h3>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="event-preview" style={{ 
                  background: '#3a3a3a', 
                  padding: '1rem', 
                  marginBottom: '0.5rem',
                  borderRadius: '8px'
                }}>
                  <div className="event-date" style={{ color: '#00d9ff', fontSize: '0.9rem' }}>
                    {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="event-title" style={{ color: 'white', fontWeight: 'bold' }}>
                    {event.title || 'Untitled Event'}
                  </div>
                  <div className="event-location" style={{ color: '#888', fontSize: '0.9rem' }}>
                    {event.location || 'Location TBD'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Feed */}
        <main className="community-main" style={{ flex: 1, marginLeft: '2rem', marginRight: '2rem' }}>
          <div className="post-composer" style={{ background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white' }}>Share with the community</h2>
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows="4"
                style={{ 
                  width: '100%', 
                  background: '#3a3a3a', 
                  color: 'white', 
                  padding: '1rem',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              />
              <button type="submit" className="btn primary-btn" style={{ 
                background: '#00d9ff', 
                color: 'black', 
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Post
              </button>
            </form>
          </div>

          {!posts || posts.length === 0 ? (
            <div className="no-posts" style={{ 
              padding: '2rem', 
              textAlign: 'center',
              background: '#2a2a2a',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#888' }}>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card" style={{ 
                background: '#2a2a2a',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{ color: 'white' }}>{post.content}</p>
              </div>
            ))
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="community-right-sidebar" style={{ background: '#2a2a2a', padding: '1rem' }}>
          <div className="sidebar-section">
            <h3 className="sidebar-title" style={{ color: 'white' }}>Community Stats</h3>
            <div className="stats-grid" style={{ display: 'grid', gap: '1rem' }}>
              <div className="stat-item" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '2rem', color: '#00d9ff', fontWeight: 'bold' }}>
                  {posts?.length || 0}
                </div>
                <div className="stat-label" style={{ color: '#888' }}>Posts</div>
              </div>
              <div className="stat-item" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '2rem', color: '#00d9ff', fontWeight: 'bold' }}>
                  {events?.length || 0}
                </div>
                <div className="stat-label" style={{ color: '#888' }}>Events</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CommunityFeed;
