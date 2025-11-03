import React, { useState } from 'react';
import './LoginPage.css';
import LoginSection from '../components/LoginSection';
import SEO from '../components/SEO';

const LoginPage = () => {
  return (
    <>
      <SEO 
        title="Login - AutoHub"
        description="Login to AutoHub to access your garage, connect with car enthusiasts, and explore the marketplace."
        keywords="login, sign in, automotive login"
        url="https://automotivehub-dv200.vercel.app/login"
      />
      <div className="login-page">
        <LoginSection />
      </div>
    </>
  );
};

export default LoginPage;
