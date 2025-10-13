import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import './LoginPage.css'; // Reusing some styling from LoginPage

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post('/api/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      console.error('Forgot password request error:', err);
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <div className="login-container">
          <div className="login-box">
            <h2>Forgot Password</h2>
            <p className="forgot-password-intro">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@example.com"
                  required
                  className="form-input"
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message">{message}</p>}
              <button type="submit" className="login-button">Send Reset Link</button>
            </form>
            <div className="login-footer-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
