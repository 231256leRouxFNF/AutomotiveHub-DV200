import React, { useState, useEffect } from 'react';
import { socialService, authService, eventService } from '../services/api';
import { trackUserAction } from '../services/analytics';
import Header from '../components/Header';
import Footer from '../components/Footer'; // Add Footer import
import communityData from '../data/community.json';
import mockPosts from '../data/mockPosts';
import { useNavigate, Link } from 'react-router-dom';
import './CommunityFeed.css';
import SEO from '../components/SEO';

const CommunityFeed = () => {
  // Use mock posts as default state
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false); // Set to false since we have mock data
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [communitySnapshots, setCommunitySnapshots] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  
  // Event creation modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  
  const currentUser = authService.getCurrentUser?.();
  const navigate = useNavigate();

  // Fetch additional data (events, stats) but keep mock posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📥 Fetching community data...');
        
        // Fetch events
        const eventsList = await eventService.getAllEvents();
        console.log('✅ Events fetched:', eventsList);
        setEvents(eventsList);

        // Use community.json data
        if (communityData.stats) {
          setCommunityStats(communityData.stats);
        }
        if (communityData.snapshots) {
          setCommunitySnapshots(communityData.snapshots);
        }
        
      } catch (error) {
        console.error('❌ Error fetching community data:', error);
        // Keep mock posts even on error
        if (communityData.stats) {
          setCommunityStats(communityData.stats);
        }
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
      'more': '⋯',
      'plus': '➕',
      'x': '✖️'
    };
    return <span className="icon">{icons[iconName] || '•'}</span>;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to post');
      navigate('/login');
      return;
    }

    if (!newPostContent.trim()) {
      alert('Please write something');
      return;
    }

    try {
      console.log('📤 Creating post...');
      
      // Create new post object
      const newPost = {
        id: posts.length + 1,
        user: {
          username: currentUser.username,
          profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=667eea&color=fff&size=48`
        },
        content: newPostContent,
        image: imagePreview, // Use the preview image
        likes: 0,
        comments: 0,
        created_at: "Just now"
      };

      // Add to posts array at the beginning
      setPosts([newPost, ...posts]);
      
      // Clear form
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      
      alert('Post created successfully!');
      
      // Cloudinary upload (if image is selected)
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('upload_preset', 'your_upload_preset'); // Replace with your upload preset

        // Upload to Cloudinary
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const cloudinaryData = await cloudinaryResponse.json();
        console.log('☁️ Cloudinary response:', cloudinaryData);

        if (cloudinaryData.secure_url) {
          // Update post with Cloudinary image URL
          const updatedPost = {
            ...newPost,
            image: cloudinaryData.secure_url
          };

          // Prepend updated post to posts
          setPosts(prevPosts => [updatedPost, ...prevPosts]);
        } else {
          alert('Image uploaded to Cloudinary, but URL retrieval failed.');
        }
      }
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLike = (postId) => {
    // Update likes count locally
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes + 1,
          isLiked: true
        };
      }
      return post;
    }));
  };

  // Event Modal Functions
  const openEventModal = () => {
    if (!currentUser) {
      alert('Please login to create an event');
      navigate('/login');
      return;
    }
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEventFormData({
      title: '',
      description: '',
      date: '',
      location: ''
    });
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventFormData.title || !eventFormData.date || !eventFormData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmittingEvent(true);
      console.log('📤 Creating event:', eventFormData);
      
      const response = await eventService.createEvent(eventFormData);
      
      if (response.success) {
        alert('Event created successfully!');
        closeEventModal();
        
        const updatedEvents = await eventService.getAllEvents();
        setEvents(updatedEvents);
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const sidebarLinks = [
    { label: 'All Discussions', icon: 'message-square', active: true },
    { label: 'Build Logs', icon: 'car' },
    { label: 'Marketplace Deals', icon: 'tag' },
    { label: 'Upcoming Events', icon: 'calendar' },
    { label: 'Tips & Tricks', icon: 'sparkles' },
    { label: 'Member Spotlight', icon: 'award' }
  ];

  return (
    <>
      <SEO 
        title="Community Feed"
        description="Connect with car enthusiasts, share your rides, and engage with the automotive community on AutoHub."
        keywords="car community, automotive social, car posts, vehicle sharing"
        url="https://automotivehub-dv200.vercel.app/community"
      />
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
            <div className="sidebar-section">
              <div className="sidebar-header">
                <h3 className="sidebar-title">Upcoming Events ({events.length})</h3>
                <button className="create-event-btn" onClick={openEventModal}>
                  {renderIcon('plus')} Create
                </button>
              </div>

              {events && events.length > 0 ? (
                events.slice(0, 3).map((event) => (
                  <div key={event.id} className="event-preview">
                    <div className="event-date">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                    </div>
                    <div className="event-title">{event.title || 'Untitled Event'}</div>
                    <div className="event-location">{event.location || 'Location TBD'}</div>
                  </div>
                ))
              ) : (
                <div className="no-events">
                  <p>No upcoming events</p>
                  <button className="btn primary-btn" onClick={openEventModal}>
                    Create First Event
                  </button>
                </div>
              )}
            </div>
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
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={removeImage}
                    >
                      {renderIcon('x')} Remove
                    </button>
                  </div>
                )}
                
                <div className="post-actions-row">
                  <label htmlFor="post-image" className="upload-image-btn">
                    📷 Add Photo
                    <input
                      type="file"
                      id="post-image"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                  
                  <button type="submit" className="btn primary-btn">
                    Post
                  </button>
                </div>
              </form>
            </div>

            {/* Display Posts */}
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                {/* User Profile Header */}
                <div className="post-header">
                  <img 
                    src={post.user.profile_image} 
                    alt={post.user.username}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h4 className="username">{post.user.username}</h4>
                    <span className="post-time">{post.created_at}</span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="post-content">
                  <p>{post.content}</p>
                  
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="Post"
                      className="post-image"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Post Actions */}
                <div className="post-actions">
                  <button 
                    className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {renderIcon('heart')} {post.likes}
                  </button>
                  <button className="action-btn">
                    {renderIcon('message')} {post.comments}
                  </button>
                  <button className="action-btn">
                    {renderIcon('share')} Share
                  </button>
                </div>
              </div>
            ))}
          </main>

          {/* Right Sidebar */}
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

        {/* Create Event Modal */}
        {showEventModal && (
          <div className="modal-overlay" onClick={closeEventModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Event</h2>
                <button className="modal-close" onClick={closeEventModal}>
                  {renderIcon('x')}
                </button>
              </div>
              
              <form onSubmit={handleEventSubmit} className="event-form">
                <div className="form-group">
                  <label htmlFor="title">Event Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={eventFormData.title}
                    onChange={handleEventInputChange}
                    placeholder="e.g., Weekend Car Meet"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={eventFormData.description}
                    onChange={handleEventInputChange}
                    placeholder="Tell us about your event..."
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={eventFormData.date}
                      onChange={handleEventInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={eventFormData.location}
                      onChange={handleEventInputChange}
                      placeholder="e.g., Central Park"
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn secondary-btn" 
                    onClick={closeEventModal}
                    disabled={isSubmittingEvent}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn primary-btn"
                    disabled={isSubmittingEvent}
                  >
                    {isSubmittingEvent ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer /> {/* Add Footer here */}
    </>
  );
};

export default CommunityFeed;
