import React from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import "../styles/Dashboard.css";



function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Header title="Dashboard" showAvatar={true} showNotification={true} />
        <p>Welcome to the Dashboard! This is just a test.</p>
      </div>
    </div>
  );
}

export default Dashboard;
