// src/components/AuthShell.jsx
import React from "react";

function AuthShell({ children, contentKey }) {
  return (
    <div className="auth-layout">
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

        {/* contentKey is optional, but keeps your fade animation behavior consistent */}
        <div className="auth-content-container fade" key={contentKey}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
