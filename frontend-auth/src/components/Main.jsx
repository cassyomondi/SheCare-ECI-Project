import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Main() {
  return (
    <section className="Main-page">
      <img src="https://shecare-nu.vercel.app/images/logo.png" alt="SheCare Logo" className="Main-logo" />
      <h1>SheCare</h1>
      <h3>Empowering Women’s Health</h3>
      <p>SheCare: Your Private AI Health Companion — on WhatsApp.</p>
      <p>
        Because women's health shouldn't wait. SheCare is an AI-powered
        assistant built for women, accessible anytime via WhatsApp. We help you
        check symptoms, find trusted clinics, and get guidance in a private,
        simple, and supportive way.
      </p>
      <div style={{ marginTop: "20px" }}>
  <Link to="/login">
    <button className="gradient-btn">Login</button>
  </Link>
  <Link to="/signup" style={{ marginLeft: "10px" }}>
    <button className="gradient-btn">Sign Up</button>
  </Link>
</div>

    </section>
  );
}

export default Main;
