import React from "react";
import "../../styles/Header.css";


function Header({ 
  title, 
  showAvatar = false, 
  showNotification = false, 
  customClass = "" 
}) {
  return (
    <header className={`dashboard-header ${customClass}`}>
      <h1>{title}</h1>
      <div className="header-right">
        {showAvatar && <span className="user-avatar">👤</span>}
        {showNotification && <span className="notification-icon">🔔</span>}
      </div>
    </header>
  );
}

export default Header;
