// src/pages/LoginPage.tsx
import React from 'react';
import LoginLayout from '../components/LoginLayout';
import LoginWelcome from '../components/LoginWelcome';
import LoginForm from '../components/LoginForm';

const LogIn = () => {
  return (
    <LoginLayout>
      <div style={{ flex: 1, background: '#44464a', color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoginWelcome />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoginForm />
      </div>
    </LoginLayout>
  );
};

export default LogIn;
