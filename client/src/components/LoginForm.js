import React from 'react';

const LoginForm = () => (
  <div className="login-form-container">
    <div className="login-form-logo">
      <img src="/logo192.png" alt="AutoHub Logo" style={{ width: 40, margin: '0 auto 16px' }} />
    </div>
    <h2>Welcome Back to AutoHub!</h2>
    <p>Sign in to access your garage, connect with the community, and explore the marketplace.</p>
    <form className="login-form">
      <input type="email" placeholder="johndoe@autohub.com" />
      <input type="password" placeholder="Password" />
      <div className="login-form-row" style={{ margin: '12px 0' }}>
        <input type="checkbox" id="recaptcha" />
        <label htmlFor="recaptcha" style={{ marginLeft: 8 }}>I'm not a robot</label>
        {/* You can replace this with a real reCAPTCHA widget */}
      </div>
      <button type="submit">Login</button>
    </form>
    <div className="login-form-links">
      <a href="#" className="forgot-password">Forgot password?</a>
      <div style={{ marginTop: 16 }}>
        Don't have an account? <a href="#">Sign Up</a>
      </div>
    </div>
  </div>
);

export default LoginForm;
