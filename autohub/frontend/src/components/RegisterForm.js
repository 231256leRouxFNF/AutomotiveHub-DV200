import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from '../services/api';
import "./RegisterForm.css";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    
    try {
      const result = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      
      if (result.success) {
        alert('Registration successful! Welcome to AutoHub!');
        // User is automatically logged in after registration
        navigate('/vehicle-management');
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && error.message) {
        errorMessage = error.message;
      }

      console.log('Final error message:', errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-block">
      <h1>Create Your AutoHub Account</h1>
      <p>Join the ultimate community for car enthusiasts.</p>
      
      {errors.general && (
        <div className="error-message" style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px', 
          padding: '12px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {errors.general}
        </div>
      )}
      
      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input
            type="text"
            name="username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <p>Email Address</p>
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <p>Password</p>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <p>Confirm Password</p>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <small className="error">{errors.confirmPassword}</small>
          )}
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="agreed"
            checked={formData.agreed}
            onChange={handleChange}
            required
          />
          <span>
            I agree to AutoHub's{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </span>
        </label>

        <button type="submit" className="register-button" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register Account'}
        </button>

        <p className="login-redirect">
          Already have an account? <button type="button" onClick={() => navigate("/login")} style={{background: 'none', border: 'none', color: '#E8618C', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit'}}>Log in</button>
        </p>
        <small className="note">
          This site is protected by reCAPTCHA and the Google Privacy Policy and
          Terms of Service apply.
        </small>
      </form>
    </div>
  );
};

export default RegisterForm;
