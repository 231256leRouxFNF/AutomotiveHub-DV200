import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Logo from './Logo';
import SearchBox from './SearchBox';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentUser && currentUser.id) {
        try {
          const count = 0;
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread notification count:', error);
        }
      }
    };

    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint (optional but good practice)
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  const mainNavItems = [
    { path: '/community', label: 'Community' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/garage', label: 'My Garage' }
  ];

  const authenticatedDropdowns = [
    {
      label: 'Buy',
      items: [
        { path: '/search', label: 'Search' },
        { path: '/favorites', label: 'Saved Items' },
        { path: '/compare', label: 'Compare' },
        { path: '/cart', label: 'Cart' },
        { path: '/orders', label: 'Orders' }
      ]
    },
    {
      label: 'Sell',
      items: [
        { path: '/sell/dashboard', label: 'Dashboard' },
        { path: '/sell/listings', label: 'My Listings' },
        { path: '/sell/events', label: 'My Events' },
        { path: '/sell/create', label: 'Create Listing' }
      ]
    },
    {
      label: 'Account',
      items: [
        { path: `/profile/${currentUser?.id}`, label: 'Profile' },
        { path: '/messages', label: 'Messages' },
        { path: '/notifications', label: 'Notifications' },
        { path: '/settings', label: 'Settings' }
      ]
    },
    {
      label: 'Support',
      items: [
        { path: '/help', label: 'Help Center' },
        { path: '/terms', label: 'Terms' },
        { path: '/privacy', label: 'Privacy' },
        { path: '/admin', label: 'Admin' }
      ]
    }
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <Logo />
        <nav className="header-nav">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          {!currentUser && (
            <Link to="/login" className="nav-link">Login</Link>
          )}

          {currentUser && (
            <div className="nav-group has-submenu">
              <span className="nav-link">More</span>
              <div className="dropdown-menu dropdown-more">
                {authenticatedDropdowns.map(dropdown => (
                  <React.Fragment key={dropdown.label}>
                    <span className="dropdown-title">{dropdown.label}</span>
                    {dropdown.items.map(item => (
                      <Link key={item.path} to={item.path} className="dropdown-item">{item.label}</Link>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="header-right">
        <SearchBox />
        <div className="header-icons">
          {currentUser ? (
            <>
              <Link to="/notifications" className="icon-link">
                <div className="notification-icon">
                  🔔
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </div>
              </Link>
              {/* Profile avatar icon */}
              <div className="profile-icon" onClick={() => navigate(`/profile/${currentUser.id}`)}>
                <img
                  src={
                    currentUser.avatar && currentUser.avatar.trim() !== ''
                      ? currentUser.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || 'User')}&background=667eea&color=fff&size=128`
                  }
                  alt="Profile Avatar"
                  title="View Profile"
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee', background: '#f0f0f0' }}
                />
              </div>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
