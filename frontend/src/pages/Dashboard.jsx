// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import Searchbar from "../components/forms/Searchbar.jsx";
import BarGraph from "../components/charts/BarGraph.jsx";
import UserRoleTrend from "../components/charts/UserRoleTrend.jsx";
import axios from "axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParticipants: 0,
    totalPractitioners: 0,
    activeSessions: 0,
  });

  const [tips, setTips] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionStats, setPrescriptionStats] = useState({
    total: 0,
    mostCommon: "",
  });

  useEffect(() => {
    // Fetch stats
    axios.get("http://127.0.0.1:5555/api/users")
      .then(res => {
        const users = res.data;
        setStats({
          totalUsers: users.length,
          totalParticipants: users.filter(u => u.role === "participant").length,
          totalPractitioners: users.filter(u => u.role === "practitioner").length,
          activeSessions: users.filter(u => u.chat_sessions && u.chat_sessions.length > 0).length,
        });
      });

    // Fetch tips
    axios.get("http://127.0.0.1:5555/api/tips")
      .then(res => setTips(res.data));

    // Fetch prescriptions
    axios.get("http://127.0.0.1:5555/api/prescriptions")
      .then(res => {
        const data = res.data;
        setPrescriptions(data);

        // Compute total and most common prescription
        const total = data.length;
        const counts = {};
        data.forEach(p => {
          const key = p.response || "Unknown";
          counts[key] = (counts[key] || 0) + 1;
        });
        const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        setPrescriptionStats({ total, mostCommon });
      });
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <Header title="Dashboard" showAvatar={true} showNotification={true} />
          <Searchbar />
        </div>

        {/* --- Stats Cards --- */}
        <div className="stats-cards">
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Participants</p>
            <p className="stat-number">{stats.totalParticipants}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Practitioners</p>
            <p className="stat-number">{stats.totalPractitioners}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active Sessions</p>
            <p className="stat-number">{stats.activeSessions}</p>
          </div>
        </div>

        {/* --- Charts --- */}
        <div className="charts-container">
          <BarGraph 
            title="User Role Comparison"
            apiUrl="http://127.0.0.1:5555/api/users"
            barColor="#6C63FF"
          />
          <UserRoleTrend 
            title="User Role Trend Over Time"
            apiUrl="http://127.0.0.1:5555/api/users"
          />
        </div>

        {/* --- Last 2 AI Generated Tips --- */}
        <h2 className="section-title">AI Generated Tips</h2>
        <div className="tips-cards">
          {tips.slice(-2).map((tip, index) => (
            <div className="tip-card" key={index}>
              <div className="tip-card-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="tip-title">{tip.title}</span>
                <span className="tip-category">{tip.category}</span>
              </div>
              <p className="tip-description">{tip.description}</p>
              <div className="tip-card-footer" style={{ textAlign: "right" }}>
                <span className="tip-date">{new Date(tip.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* --- Prescription Stats Cards --- */}
        <h2 className="section-title">Prescription Stats</h2>
        <div className="stats-cards">
          <div className="stat-card">
            <p className="stat-label">Total Prescriptions</p>
            <p className="stat-number">{prescriptionStats.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Most Common Prescription</p>
            <p className="stat-number">{prescriptionStats.mostCommon}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
