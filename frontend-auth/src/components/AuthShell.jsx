import React from "react";

function AuthShell({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-left" aria-hidden="true">
        <div className="auth-left-content" />
      </div>

      <div className="auth-right auth-right-centered">
        <img
          src="https://shecare-nu.vercel.app/images/logo.png"
          alt="SheCare Logo"
          className="auth-logo-top"
        />

        <div className="auth-content-container fade">{children}</div>
      </div>
    </div>
  );
}

export default AuthShell;
