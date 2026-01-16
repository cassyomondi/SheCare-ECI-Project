// Main.jsx
import React, { useState } from "react";
import "../App.css";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

function Main({ setUser }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"

  return (
    <div className={`auth-layout ${mode === "signin" ? "is-signin" : "is-signup"}`}>
      {/* LEFT (Desktop only via CSS) */}
      <div className="auth-left" aria-hidden="true">
        <div className="auth-left-content" />
      </div>

      {/* RIGHT */}
      <div className="auth-right auth-right-centered">
        <img
          src="https://shecare-nu.vercel.app/images/logo.png"
          alt="SheCare Logo"
          className="auth-logo-top"
        />

        <div className="auth-content-container fade" key={mode}>
          {mode === "signin" ? (
            <SignIn setUser={setUser} onSwitch={() => setMode("signup")} />
          ) : (
            <SignUp setUser={setUser} onSwitch={() => setMode("signin")} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;
