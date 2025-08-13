import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, number, label, className = '' }) => {
  return (
    <div className={`stat-card ${className}`}>
      {icon && <div className="stat-icon-wrapper">{icon}</div>}
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatCard;
