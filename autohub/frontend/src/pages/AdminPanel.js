import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, eventService, socialService, adminService } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const events = await eventService.getAllEvents();
      const posts = await socialService.getPosts();
      const users = await adminService.getAllUsers();
      
      setPendingEvents(events.filter(event => event.status === 'pending'));
      setAllPosts(posts);
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await eventService.updateEventStatus(eventId, 'approved');
      alert('Event approved successfully!');
      loadData();
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Failed to approve event');
    }
  };

  const handleDenyEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      alert('Event denied and deleted');
      loadData();
    } catch (error) {
      console.error('Error denying event:', error);
      alert('Failed to deny event');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await adminService.deletePost(postId);
        alert('Post deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their posts, vehicles, and other data.')) {
      try {
        await adminService.deleteUser(userId);
        alert('User deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Site
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'events' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('events')}
        >
          Pending Events ({pendingEvents.length})
        </button>
        <button
          className={activeTab === 'posts' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('posts')}
        >
          All Posts ({allPosts.length})
        </button>
        <button
          className={activeTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('users')}
        >
          All Users ({allUsers.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'events' && (
          <div className="events-section">
            <h2>Pending Events</h2>
            {pendingEvents.length === 0 ? (
              <p>No pending events to review</p>
            ) : (
              <div className="events-grid">
                {pendingEvents.map((event) => (
                  <div key={event._id} className="admin-card">
                    <h3>{event.title}</h3>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Description:</strong> {event.description}</p>
                    <p><strong>Organizer:</strong> {event.organizer?.username || 'Unknown'}</p>
                    <div className="admin-actions">
                      <button
                        onClick={() => handleApproveEvent(event._id)}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDenyEvent(event._id)}
                        className="deny-btn"
                      >
                        Deny & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="posts-section">
            <h2>All Posts</h2>
            {allPosts.length === 0 ? (
              <p>No posts to review</p>
            ) : (
              <div className="posts-grid">
                {allPosts.map((post) => (
                  <div key={post._id} className="admin-card">
                    <div className="post-header">
                      <strong>{post.author?.username || 'Unknown'}</strong>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{post.content}</p>
                              {post.image_url && (
                                <img src={post.image_url} alt="Post" className="post-image" />
                              )}
                    <div className="admin-actions">
                      <button
                                  onClick={() => handleDeletePost(post.id)}
                        className="delete-btn"
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>All Users</h2>
            {allUsers.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="delete-btn"
                            disabled={user.id === currentUser?.id}
                          >
                            {user.id === currentUser?.id ? 'You' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;