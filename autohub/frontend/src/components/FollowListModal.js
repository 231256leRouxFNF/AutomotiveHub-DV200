import React, { useEffect, useState } from 'react';
import './FollowListModal.css';
import { userService } from '../services/api';
import { Link } from 'react-router-dom';

const FollowListModal = ({ userId, type, onClose }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollows = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserFollows(userId, type);
        setList(data);
      } catch (err) {
        console.error(`Error fetching ${type} list:`, err);
        setError(`Failed to load ${type}.`);
      } finally {
        setLoading(false);
      }
    };

    if (userId && type) {
      fetchFollows();
    }
  }, [userId, type]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent clicks inside from closing modal */}
        <div className="modal-header">
          <h2>{type === 'followers' ? 'Followers' : 'Following'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && list.length === 0 && (
            <p>No {type} to display.</p>
          )}
          <ul className="follow-list">
            {!loading && !error && list.map(user => (
              <li key={user.id} className="follow-list-item">
                <Link to={`/profile/${user.id}`} onClick={onClose} className="follow-user-link">
                  <img src={user.avatar_url || 'https://i.pravatar.cc/50'} alt="Avatar" className="follow-user-avatar" />
                  <span className="follow-user-name">{user.display_name || user.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;

