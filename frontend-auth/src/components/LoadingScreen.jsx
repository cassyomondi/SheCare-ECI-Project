import React from "react";
import "../styles/base.css";

export default function LoadingScreen({ label = "Loading..." }) {
  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="app-loader__label">{label}</div>

      <div className="app-loader__bar" aria-hidden="true">
        <div className="app-loader__barFill" />
      </div>
    </div>
  );
}
