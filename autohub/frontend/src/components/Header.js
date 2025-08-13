import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
      
      <SearchBox />
    </header>
  );
};

export default Header;
