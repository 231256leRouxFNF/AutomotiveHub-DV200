import { Link } from 'react-router-dom';
import logo1 from '../assets/Logo-1.png';
import logo2 from '../assets/Logo-2.png';


const LoginSection = () => {
  return (
    <div className="login-container">
      <div className="left-panel">
        <img src={logo1} alt="AutoHub logo" className="logo" />
        <p className="tagline">Connect, Showcase, Trade. Your ultimate automotive community.</p>
      </div>

      <div className="right-panel">
        <div className="login-form-box">
          <img src={logo2} alt="AutoHub" className="small-logo" />
          <h2>Welcome Back to AutoHub!</h2>
          <p className="subtext">Sign in to access your garage, connect with the community, and explore the marketplace.</p>
          <form className="login-form">
            <input type="email" placeholder="johndoe@autohub.com" required />
            <input type="password" placeholder="Password" required />

            <div className="forgot">
              <a href="#">Forgot password?</a>
            </div>

            <div className="captcha">
              <input type="checkbox" id="captcha" />
              <label htmlFor="captcha">I'm not a robot</label>
            </div>

            <button type="submit">Login</button>

            <div className="signup">
              Don’t have an account? <Link to="/RegistrationPage">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSection;