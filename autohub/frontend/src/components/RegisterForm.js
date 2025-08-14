import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    console.log("Form submitted:", formData);
    // TODO: Send data to backend

    // Simulate successful registration and redirect to login
    alert("Registration successful! Please log in with your new account.");
    navigate("/login");
  };

  return (
    <div className="register-block">
      <h1>Create Your AutoHub Account</h1>
      <p>Join the ultimate community for car enthusiasts.</p>
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

        <button type="submit" className="register-button">
          Register Account
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
