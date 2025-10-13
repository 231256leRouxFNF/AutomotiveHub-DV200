import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import './LoginPage.css'; // Reusing some styling from LoginPage

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Optionally, you can add a backend call here to verify the token's validity
    // upon page load, to provide immediate feedback to the user.
    // For simplicity, we'll rely on the /api/reset-password endpoint to do the full validation.
    if (!token) {
      setIsValidToken(false);
      setError('No reset token provided.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await axios.post('/api/reset-password', { token, newPassword });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect to login after 3 seconds
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  if (!isValidToken) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="page-container">
          <div className="login-container">
            <div className="login-box">
              <h2>Invalid or Missing Token</h2>
              <p className="error-message">{error}</p>
              <Link to="/forgot-password">Request a new reset link</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <div className="login-container">
          <div className="login-box">
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  className="form-input"
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              {message && <p className="success-message">{message}</p>}
              <button type="submit" className="login-button">Reset Password</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
