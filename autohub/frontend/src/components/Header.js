import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import SearchBox from './SearchBox';
import './Header.css';

const Header = () => {
  const location = useLocation();

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
        </nav>
      </div>

      <div className="header-right">
        <SearchBox />
        <div className="header-icons">
          <div className="notification-icon">🔔</div>
          <div className="settings-icon">⚙️</div>
          <div className="avatar">👤</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
