import React from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import './PageLayout.css';
import { authService, notificationService } from '../services/api';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUser = authService.getCurrentUser();
  const userId = currentUser ? currentUser.id : null;

  const fetchNotifications = async () => {
    if (userId) {
      try {
        const fetchedNotifications = await notificationService.getNotifications(userId);
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prevNotifs =>
        prevNotifs.map(notif =>
          notif.id === id ? { ...notif, isRead: 1 } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prevNotifs => prevNotifs.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">Notifications</h1>
        <section className="notifications-section">
          {notifications.length > 0 ? (
            <ul className="notifications-list">
              {notifications.map((notification) => (
                <li key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    {notification.link && (
                      <a href={notification.link} className="notification-link">View Details</a>
                    )}
                    <span className="notification-timestamp">{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button onClick={() => handleMarkAsRead(notification.id)} className="mark-read-btn">Mark as Read</button>
                    )}
                    <button onClick={() => handleDeleteNotification(notification.id)} className="delete-btn">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-notifications">No new notifications.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsCenter;
