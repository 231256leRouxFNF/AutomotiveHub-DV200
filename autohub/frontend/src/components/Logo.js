import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/Logo-1.png';

const Logo = () => {
  return (
    <Link to="/" className="logo-link">
      <img 
        src={logoImage} 
        alt="AutoHub" 
        className="logo-image"
      />
    </Link>
  );
};

export default Logo;
