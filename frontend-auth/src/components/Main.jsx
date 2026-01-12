import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Main() {
  return (
    <div className="auth-layout">
      {/* LEFT SIDE */}
      <div className="auth-left">
        <div className="auth-left-content centered-top">
          <img
            src="https://shecare-nu.vercel.app/images/logo.png"
            alt="SheCare Logo"
            className="auth-logo"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right auth-right-centered">
        <h2 className="auth-title centered-text">Sign In</h2>

        <form className="auth-form centered-form">
          <input
            type="tel"
            placeholder="Phone number"
            className="auth-input"
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
          />

          <button type="submit" className="auth-submit">
            Sign In
          </button>
        </form>

        <p className="auth-footer centered-text">
          No account yet?{" "}
          <Link to="/signup" className="auth-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Main;
