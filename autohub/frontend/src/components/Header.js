import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import SearchBox from './SearchBox';
import './Header.css';
import { authService, notificationService } from '../services/api';

const Header = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentUser && currentUser.id) {
        try {
          const count = await notificationService.getUnreadCount(currentUser.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread notification count:', error);
        }
      }
    };

    fetchUnreadCount();

    // Optional: Poll for new notifications every X seconds
    const intervalId = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const navItems = [
    { path: '/community', label: 'Community' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/garage', label: 'My Garage' }
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <Logo />
        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          <div className="nav-group">
            <span className="nav-link has-submenu">Buy</span>
            <div className="dropdown-menu">
              <Link to="/search" className="dropdown-item">Search</Link>
              <Link to="/favorites" className="dropdown-item">Saved Items</Link>
              <Link to="/compare" className="dropdown-item">Compare</Link>
              <Link to="/cart" className="dropdown-item">Cart</Link>
              <Link to="/orders" className="dropdown-item">Orders</Link>
            </div>
          </div>

          <div className="nav-group">
            <span className="nav-link has-submenu">Sell</span>
            <div className="dropdown-menu">
              <Link to="/sell/dashboard" className="dropdown-item">Dashboard</Link>
              <Link to="/sell/listings" className="dropdown-item">My Listings</Link>
              <Link to="/sell/events" className="dropdown-item">My Events</Link>
              <Link to="/sell/create" className="dropdown-item">Create Listing</Link>
            </div>
          </div>

          <div className="nav-group">
            <span className="nav-link has-submenu">Account</span>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Profile</Link>
              <Link to="/messages" className="dropdown-item">Messages</Link>
              <Link to="/notifications" className="dropdown-item">Notifications</Link>
              <Link to="/settings" className="dropdown-item">Settings</Link>
            </div>
          </div>

          <div className="nav-group">
            <span className="nav-link has-submenu">Support</span>
            <div className="dropdown-menu">
              <Link to="/help" className="dropdown-item">Help Center</Link>
              <Link to="/terms" className="dropdown-item">Terms</Link>
              <Link to="/privacy" className="dropdown-item">Privacy</Link>
              <Link to="/about-us" className="dropdown-item">About Us</Link>
              <Link to="/admin" className="dropdown-item">Admin</Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="header-right">
        <SearchBox />
        <div className="header-icons">
          <Link to="/notifications" className="icon-link">
            <div className="notification-icon">
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
          </Link>
          <Link to="/settings" className="icon-link"><div className="settings-icon">⚙️</div></Link>
          <Link to="/profile" className="icon-link"><div className="avatar">👤</div></Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
