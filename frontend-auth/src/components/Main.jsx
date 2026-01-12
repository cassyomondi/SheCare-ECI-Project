import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Main() {
  return (
    <div className="auth-layout">
      {/* LEFT SIDE - Now empty or you can remove this div if not needed */}
      <div className="auth-left">
        <div className="auth-left-content">
          {/* Logo was here */}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right auth-right-centered">
  {/* Logo at the very top */}
  <img
    src="https://shecare-nu.vercel.app/images/logo.png"
    alt="SheCare Logo"
    className="auth-logo-top"
  />

  {/* Form Content container */}
  <div className="auth-content-container">
    <h2 className="auth-title">Sign In to talk to SheCare on WhatsApp</h2>
    <form className="auth-form">
      {/* ... inputs ... */}
      <input type="tel" placeholder="Phone number" className="auth-input" />
      <input type="password" placeholder="Password" className="auth-input" />
      <button type="submit" className="auth-submit">Sign In</button>
    </form>
    
    <p className="auth-footer">
      No account yet? <Link to="/signup" className="auth-link">Sign Up</Link>
    </p>
  </div>
</div>
    </div>
  );
}

export default Main;