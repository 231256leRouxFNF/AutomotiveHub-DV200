// src/pages/LoginPage.tsx
import React from 'react';

const LoginPage = () => {
  return (
    <div className="login-page">
      <h2>Login to AutoHub</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default LoginPage;
