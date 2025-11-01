import { useState, useEffect } from 'react';
import { socialService, authService, eventService } from '../services/api';
import Header from '../components/Header';
import communityData from '../data/community.json'; // This has your mock posts
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📥 Fetching community feed data...');
        
        // Fetch events from API
        const eventsList = await eventService.getAllEvents();
        console.log('✅ Events fetched:', eventsList);
        setEvents(eventsList);
        
        // Fetch posts from API (if empty, use mock data)
        const postsList = await socialService.getPosts();
        console.log('✅ Posts fetched:', postsList);
        
        // Use mock data from community.json if no posts from API
        if (postsList.length === 0 && communityData.posts) {
          console.log('📦 Using mock posts from community.json');
          setPosts(communityData.posts);
        } else {
          setPosts(postsList);
        }

        // Load mock community stats and snapshots
        if (communityData.stats) {
          setCommunityStats(communityData.stats);
        }
        if (communityData.snapshots) {
          setCommunitySnapshots(communityData.snapshots);
        }
        
      } catch (error) {
        console.error('❌ Error fetching community data:', error);
        setError(error.message);
        
        // Fallback to mock data on error
        if (communityData.posts) {
          setPosts(communityData.posts);
        }
        if (communityData.stats) {
          setCommunityStats(communityData.stats);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderIcon = (iconName) => {
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
    if (!comment?.trim()) return;
    console.log('Comment feature coming soon');
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
        <div className="loading" style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
          Loading community feed...
        </div>
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
          {events && events.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Upcoming Events ({events.length})</h3>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="event-preview">
                  <div className="event-date">
                    {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="event-title">{event.title || 'Untitled Event'}</div>
                  <div className="event-location">{event.location || 'Location TBD'}</div>
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

          {/* Display Posts */}
          {!posts || posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <img src={post.authorAvatar || '/default-avatar.png'} alt={post.author} className="author-avatar" />
                    <div>
                      <h4>{post.author}</h4>
                      <span className="post-time">{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="post-content">
                  {editingPostId === post.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="4"
                    />
                  ) : (
                    <p>{post.content}</p>
                  )}
                  {post.image && <img src={post.image} alt="Post" className="post-image" />}
                </div>

                <div className="post-stats">
                  <span>{post.likes || 0} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>

                <div className="post-actions">
                  <button onClick={() => handleLike(post.id)}>
                    {renderIcon('heart')} Like
                  </button>
                  <button onClick={() => setCommentDrafts({...commentDrafts, [post.id]: ''})}>
                    {renderIcon('message')} Comment
                  </button>
                </div>

                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="comments-section">
                    {post.comments.map((comment, idx) => (
                      <div key={idx} className="comment">
                        <strong>{comment.author}:</strong> {comment.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {commentDrafts[post.id] !== undefined && (
                  <div className="comment-input">
                    <input
                      type="text"
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) => setCommentDrafts({...commentDrafts, [post.id]: e.target.value})}
                      placeholder="Write a comment..."
                    />
                    <button onClick={() => handleAddComment(post.id, commentDrafts[post.id])}>
                      Post
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="community-right-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Community Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{posts?.length || 0}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{events?.length || 0}</div>
                <div className="stat-label">Events</div>
              </div>
            </div>
          </div>

          {/* Community Snapshots */}
          {communitySnapshots && communitySnapshots.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Community Highlights</h3>
              {communitySnapshots.map((snapshot, index) => (
                <div key={index} className="snapshot-item">
                  <img src={snapshot.image} alt={snapshot.title} />
                  <p>{snapshot.title}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CommunityFeed;
