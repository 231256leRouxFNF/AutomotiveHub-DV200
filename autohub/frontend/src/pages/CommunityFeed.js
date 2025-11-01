import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socialService, authService } from '../services/api';
import Header from '../components/Header';
import communityData from '../data/community.json';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import ProfilePreview from '../components/ProfilePreview'; // Import the new component
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
  const currentUser = authService.getCurrentUser?.();
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [communityUsers, setCommunityUsers] = useState([]); // State for community users
  // Per-device owner key for author controls when not authenticated
  const OWNER_KEY_STORAGE = 'autohub_owner_key';
  const HIDDEN_POSTS_STORAGE = 'autohub_hidden_posts';
  const getOwnerKey = () => {
    try {
      let k = localStorage.getItem(OWNER_KEY_STORAGE);
      if (!k) {
        k = `owner-${Math.random().toString(36).slice(2)}-${Date.now()}`;
        localStorage.setItem(OWNER_KEY_STORAGE, k);
      }
      return k;
    } catch {
      return undefined;
    }
  };
  const ownerKey = getOwnerKey();
  const navigate = useNavigate();

  // Hidden posts (for locally hiding server posts the user "deleted")
  const loadHiddenIds = () => {
    try {
      const raw = localStorage.getItem(HIDDEN_POSTS_STORAGE);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const saveHiddenIds = (arr) => {
    try { localStorage.setItem(HIDDEN_POSTS_STORAGE, JSON.stringify(arr || [])); } catch {}
  };

  // Local persistence for user-created posts
  const LOCAL_POSTS_KEY = 'autohub_user_posts';
  const loadLocalPosts = () => {
    try {
      const raw = localStorage.getItem(LOCAL_POSTS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const saveLocalPosts = (arr) => {
    try { localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(arr || [])); } catch {}
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('📥 Fetching community feed data...');
        
        // Fetch events from API
        const eventsResponse = await axios.get('/api/events');
        console.log('✅ Events response:', eventsResponse.data);
        
        if (eventsResponse.data.success) {
          setEvents(eventsResponse.data.events || []);
        }
        
        // Add other data fetching here (posts, stats, etc.)
        
      } catch (error) {
        console.error('❌ Error fetching community data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const config = { headers: { 'Authorization': `Bearer ${authService.getToken()}` } };
        const [p, s, snaps, e, communityUsersData] = await Promise.all([
          // Prefer socialService to fetch shared posts; fall back to legacy endpoint
          socialService.getAllPosts().catch(() => axios.get('/api/posts')),
          axios.get('/api/community/stats'),
          axios.get('/api/community/snapshots').catch(() => ({ data: [] })),
          eventService.getAllEvents(), // Fetch all events
          axios.get('/api/community/users', config) // Fetch community users
        ]);
        if (!cancelled) {
          const postsData = Array.isArray(p?.data ?? p) ? (p?.data ?? p) : [];

          // Use imported static dataset as fallback
          const remoteRaw = postsData.length ? postsData : (communityData.posts || []);
          const hidden = new Set(loadHiddenIds());
          const remote = remoteRaw.filter((r) => r && !hidden.has(r.id));
          // Merge with locally created posts (show local first)
          const locals = loadLocalPosts();
          // de-dupe by id, preferring local
          const seen = new Set(locals.map((x) => x.id));
          const merged = [...locals, ...remote.filter((r) => r && !seen.has(r.id))];
          setPosts(merged);

          const incomingStats = Array.isArray(s.data) ? s.data : [];
          const fallbackStats = communityData.stats || [];
          setCommunityStats(incomingStats.length ? incomingStats : fallbackStats);

          // Normalize snapshots: accept array of strings or objects with `image` field
          let snapshots = Array.isArray(snaps.data) ? snaps.data : [];
          snapshots = snapshots.map((item) => {
            if (typeof item === 'string') return { id: item, image: item };
            if (item && item.image) return { id: item.id || item.image, image: item.image, alt: item.alt };
            return null;
          }).filter(Boolean);

          // Fallback to images from posts if API returns nothing
          if (!snapshots.length) {
            const source = merged
              .filter((post) => post && post.image)
              .slice(0, 9)
              .map((post) => ({ id: post.id, image: post.image, alt: post.content }));
            snapshots = source;
          }

          // If still empty, provide static snapshots
          if (!snapshots.length) {
            snapshots = [
              { id: 'snap-1', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop' },
              { id: 'snap-2', image: 'https://images.unsplash.com/photo-1519580930-4f119914eec8?q=80&w=1200&auto=format&fit=crop' },
              { id: 'snap-3', image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop' }
            ];
          }
          setCommunitySnapshots(snapshots);

          // Set events data
          setEvents(Array.isArray(e) ? e : []);

          // Set community users data
          setCommunityUsers(Array.isArray(communityUsersData.data) ? communityUsersData.data : []);
        }
      } catch (e) {
        if (!cancelled) {
          const fbAll = (communityData.posts || []);
          const hidden = new Set(loadHiddenIds());
          const fbPosts = fbAll.filter((r) => r && !hidden.has(r.id));
          // Merge local posts with static fallback on error
          const locals = loadLocalPosts();
          const seen = new Set(locals.map((x) => x.id));
          const merged = [...locals, ...fbPosts.filter((r) => r && !seen.has(r.id))];
          setPosts(merged);
          const fbStats = (communityData.stats || []);
          setCommunityStats(fbStats);
          const snaps = merged
            .filter((post) => post && post.image)
            .slice(0, 9)
            .map((post) => ({ id: post.id, image: post.image, alt: post.content }));
          setCommunitySnapshots(snaps);
          setEvents([]); // Set events to empty array on error as well
          setCommunityUsers([]); // Set community users to empty array on error
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events'); // Should be GET /api/events
        console.log('Events fetched:', response.data);
        setEvents(response.data.events); // Make sure you're accessing .events
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
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
    return <span>{icons[iconName] || '•'}</span>;
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      // Add your post submission logic here
      console.log('Submitting post:', newPostContent);
      alert('Post feature coming soon!');
      setNewPostContent('');
      // Refresh posts
    } catch (error) {
      console.error('Failed to submit post:', error);
    }
  };

  const handleLike = async (postId) => {
    console.log('Like feature coming soon for post:', postId);
  };

  const handleEditPost = (postId, currentContent) => {
    setEditingPostId(postId);
    setEditContent(currentContent);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    console.log('Delete feature coming soon for post:', postId);
  };

  const handleAddComment = async (postId, comment) => {
    if (!comment.trim()) return;
    console.log('Comment feature coming soon:', postId, comment);
    setCommentDrafts(prev => ({
      ...prev,
      [postId]: ''
    }));
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
        <div className="loading">Loading community feed...</div>
      </div>
    );
  }

  return (
    <div className="community-feed">
      <Header />
      
      <div className="community-container">
        {/* Sidebar */}
        <aside className="community-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Explore Communities</h3>
            <nav className="sidebar-nav">
              {sidebarLinks.map((link, index) => (
                <button
                  key={index}
                  className={`sidebar-link ${link.active ? 'active' : ''}`}
                >
                  {renderIcon(link.icon)}
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Upcoming Events */}
          {events.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Upcoming Events</h3>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="event-preview">
                  <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
                  <div className="event-title">{event.title}</div>
                  <div className="event-location">{event.location}</div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Feed */}
        <main className="community-main">
          <div className="post-composer">
            <h2>Share with the community</h2>
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows="4"
              />
              <button type="submit" className="btn primary-btn">
                Post
              </button>
            </form>
          </div>

          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                {/* Your existing post rendering code */}
              </div>
            ))
          )}
        </main>

        {/* Right Sidebar - Stats */}
        <aside className="community-right-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Community Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{posts.length}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{events.length}</div>
                <div className="stat-label">Events</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CommunityFeed;
