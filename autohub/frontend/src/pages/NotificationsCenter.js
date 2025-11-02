import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './NotificationsCenter.css';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'like',
        message: 'John liked your post',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        type: 'comment',
        message: 'Sarah commented on your vehicle',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.read === (filter === 'read'));

  return (
    <div className="notifications-page">
      <Header />
      <div className="notifications-container">
        <h1>Notifications</h1>
        
        <div className="notification-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''} 
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={filter === 'read' ? 'active' : ''} 
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <p className="no-notifications">No notifications yet</p>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
