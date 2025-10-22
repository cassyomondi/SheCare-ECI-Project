// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import Searchbar from "../components/forms/Searchbar.jsx";
import BarGraph from "../components/charts/BarGraph.jsx";
import UserRoleTrend from "../components/charts/UserRoleTrend.jsx";
import "../styles/Dashboard.css";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParticipants: 0,
    totalPractitioners: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    axios.get("http://127.0.0.1:5555/api/users")
      .then(res => {
        const users = res.data;
        const totalUsers = users.length;
        const totalParticipants = users.filter(u => u.role === "participant").length;
        const totalPractitioners = users.filter(u => u.role === "practitioner").length;
        const activeSessions = users.filter(u => u.chat_sessions && u.chat_sessions.length > 0).length;

        setStats({ totalUsers, totalParticipants, totalPractitioners, activeSessions });
      })
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <Header title="Dashboard" showAvatar={true} showNotification={true} />
          <Searchbar />
        </div>

        {/* Stats Cards */}
        <div className="stats-cards" style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
          <div className="stat-card">
            <p>Total Users</p>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <p>Total Participants</p>
            <p className="stat-number">{stats.totalParticipants}</p>
          </div>
          <div className="stat-card">
            <p>Total Practitioners</p>
            <p className="stat-number">{stats.totalPractitioners}</p>
          </div>
          <div className="stat-card">
            <p>Active Sessions</p>
            <p className="stat-number">{stats.activeSessions}</p>
          </div>
        </div>

        {/* Charts side by side */}
        <div className="charts-container" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "400px" }}>
            <BarGraph
              title="User Role Comparison"
              apiUrl="http://127.0.0.1:5555/api/users"
              barColor="#6C63FF"
            />
          </div>
          <div style={{ flex: 1, minWidth: "400px" }}>
            <UserRoleTrend
              title="User Role Trend Over Time"
              apiUrl="http://127.0.0.1:5555/api/users"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
