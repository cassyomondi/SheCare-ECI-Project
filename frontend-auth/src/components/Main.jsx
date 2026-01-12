import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Main() {
  return (
    <section className="main-page">
      <img
        src="https://shecare-nu.vercel.app/images/logo.png"
        alt="SheCare Logo"
        className="main-logo"
      />
      <h1 className="main-title">SheCare</h1>
      <h3 className="main-subtitle">Empowering Women’s Health</h3>
      <p className="main-description">
        SheCare: Your Private AI Health Companion — on WhatsApp.
      </p>
      <p className="main-description">
        Because women's health shouldn't wait. SheCare is an AI-powered assistant
        built for women, accessible anytime via WhatsApp. We help you check symptoms,
        find trusted clinics, and get guidance in a private, simple, and supportive way.
      </p>
      <div className="main-buttons">
        <Link to="/signin">
          <button className="gradient-btn">Sign In</button>
        </Link>
        <Link to="/signup">
          <button className="gradient-btn signup-btn">Sign Up</button>
        </Link>
      </div>
    </section>
  );
}

export default Main;
