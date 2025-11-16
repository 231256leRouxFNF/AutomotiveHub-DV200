import React from 'react';
import './Profile.css';

const Profile = () => {
  // Dummy user data for now
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/150',
    bio: 'Car enthusiast. Love sharing and discovering new vehicles.'
  };

  return (
    <div className="profile-container">
      <img className="profile-avatar" src={user.avatar} alt="User Avatar" />
      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-email">{user.email}</p>
      <p className="profile-bio">{user.bio}</p>
    </div>
  );
};

export default Profile;
