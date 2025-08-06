const LoginSection = () => {
  return (
    <div className="login-container">
      <div className="left-panel">
        <img src="/autohub-logo.png" alt="AutoHub logo" className="logo" />
        <p className="tagline">Connect, Showcase, Trade. Your ultimate automotive community.</p>
      </div>

      <div className="right-panel">
        <div className="login-form-box">
          <img src="/autohub-logo.png" alt="AutoHub" className="small-logo" />
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
              Don’t have an account? <a href="#">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSection;