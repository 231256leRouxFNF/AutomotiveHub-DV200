import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginSection = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isRobot, setIsRobot] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRobot) {
      alert("Please confirm you're not a robot");
      return;
    }

    try {
      const res = await axios.post('/api/login', {
        identifier: formData.identifier,
        password: formData.password,
      });

      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
        }
        alert('Login successful! Welcome to AutoHub.');
        navigate('/vehicle-management');
      } else {
        alert(res.data?.message || 'Login failed');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials or server unavailable';
      alert(msg);
    }
  };

  return (
    <div className="login-main-container">
      <div className="left-side-panel">
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/9ef049a5ff8fc71504d9480ac2dbace1b0e28b82?width=1728" 
          alt="Automotive background" 
          className="background-image"
        />
        <div className="overlay">
          <div className="left-content">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/2023a96c51a30b9b6b6eb24c5cfc06ca8ef44740?width=1114" 
              alt="AutoHub Logo" 
              className="main-logo"
            />
            <p className="hero-tagline">Connect, Showcase, Trade. Your ultimate automotive community.</p>
          </div>
        </div>
      </div>

      <div className="right-side-panel">
        <div className="login-form-container">
          <div className="logo-section">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/23f19c01c14c1cc2111bbc6dce96b8a7f25ba695?width=444" 
              alt="AutoHub" 
              className="form-logo"
            />
          </div>
          
          <h1 className="welcome-title">Welcome Back to AutoHub!</h1>
          <p className="welcome-subtitle">Sign in to access your garage, connect with the community, and explore the marketplace.</p>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="identifier"
                placeholder="Email or username"
                className="form-input"
                value={formData.identifier}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="form-input password-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.00052 2.64038C9.55948 2.64044 11.0835 3.10345 12.379 3.97057C13.5936 4.7835 14.5564 5.9173 15.1617 7.24334L15.2783 7.51161L15.2868 7.53385C15.3845 7.7971 15.3967 8.08339 15.3234 8.35239L15.2868 8.46623C15.284 8.47366 15.2813 8.48117 15.2783 8.48847C14.6838 9.92977 13.6747 11.1624 12.379 12.0296C11.1645 12.8425 9.74902 13.2997 8.2923 13.3538L8.00052 13.3597C6.44141 13.3597 4.91697 12.8967 3.62129 12.0296C2.40656 11.2165 1.44394 10.0823 0.838568 8.75607L0.722102 8.48847C0.719081 8.48117 0.716354 8.47366 0.713593 8.46623C0.601961 8.16546 0.601998 7.83468 0.713593 7.53385L0.722102 7.51161C1.31651 6.07035 2.32569 4.83774 3.62129 3.97057C4.91697 3.10339 6.44141 2.64038 8.00052 2.64038ZM8.00052 3.98038C6.70682 3.98038 5.44167 4.36461 4.36653 5.08418C3.29826 5.79922 2.46491 6.81347 1.9705 7.9997C2.46491 9.18614 3.2981 10.2008 4.36653 10.9159C5.44167 11.6355 6.70682 12.0197 8.00052 12.0197L8.24259 12.0151C9.45134 11.9703 10.6259 11.5905 11.6338 10.9159C12.7022 10.2009 13.5348 9.18607 14.0292 7.9997C13.5348 6.8136 12.702 5.79917 11.6338 5.08418C10.5588 4.36467 9.29409 3.98044 8.00052 3.98038Z" fill="#8C8D8B"/>
                  <path d="M9.34031 7.99995C9.34031 7.25986 8.74039 6.65995 8.00031 6.65995C7.26023 6.65995 6.66031 7.25986 6.66031 7.99995C6.66031 8.74003 7.26023 9.33995 8.00031 9.33995C8.74039 9.33995 9.34031 8.74003 9.34031 7.99995ZM10.6803 7.99995C10.6803 9.48004 9.48041 10.6799 8.00031 10.6799C6.52019 10.6799 5.32031 9.48004 5.32031 7.99995C5.32031 6.51982 6.52019 5.31995 8.00031 5.31995C9.48041 5.31995 10.6803 6.51982 10.6803 7.99995Z" fill="#8C8D8B"/>
                </svg>
              </button>
            </div>
            
            <div className="forgot-password">
              <Link to="#" className="forgot-link">Forgot password?</Link>
            </div>
            
            <div className="captcha-container">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="robot-check" 
                  checked={isRobot}
                  onChange={(e) => setIsRobot(e.target.checked)}
                  className="robot-checkbox"
                />
                <label htmlFor="robot-check" className="robot-label">I'm not a robot</label>
              </div>
            </div>
            
            <button type="submit" className="login-button">Login</button>
            
            <div className="signup-section">
              <span className="signup-text">Don't have an account? </span>
              <Link to="/RegistrationPage" className="signup-link">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSection;
