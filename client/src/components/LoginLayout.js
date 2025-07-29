import React from 'react';

const LoginLayout = ({ children }) => (
  <div className="login-layout" style={{ display: 'flex', minHeight: '100vh', background: '#fafbfc' }}>
    {children}
  </div>
);

export default LoginLayout;
