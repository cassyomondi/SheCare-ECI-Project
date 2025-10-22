// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import Searchbar from "../components/forms/Searchbar.jsx";
import BarGraph from "../components/charts/BarGraph.jsx";
import UserRoleTrend from "../components/charts/UserRoleTrend.jsx";
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

  useEffect(() => {
    // --- Fetch users and stats ---
    axios.get("http://127.0.0.1:5555/api/users")
      .then(res => {
        const data = res.data;
        const totalUsers = data.length;
        const totalParticipants = data.filter(u => u.role === "participant").length;
        const totalPractitioners = data.filter(u => u.role === "practitioner").length;
        const activeSessions = data.filter(u => u.activeSession).length;
        setStats({ totalUsers, totalParticipants, totalPractitioners, activeSessions });
      })
      .catch(err => console.error("Error fetching users:", err));

    // --- Fetch AI-generated tips ---
    axios.get("http://127.0.0.1:5555/api/tips")
      .then(res => setTips(res.data))
      .catch(err => console.error("Error fetching tips:", err));

    // --- Fetch prescriptions ---
    axios.get("http://127.0.0.1:5555/api/prescriptions")
      .then(res => setPrescriptions(res.data))
      .catch(err => console.error("Error fetching prescriptions:", err));
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
            <p className="stat-title">Total Users</p>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-title">Total Participants</p>
            <p className="stat-number">{stats.totalParticipants}</p>
          </div>
          <div className="stat-card">
            <p className="stat-title">Total Practitioners</p>
            <p className="stat-number">{stats.totalPractitioners}</p>
          </div>
          <div className="stat-card">
            <p className="stat-title">Active Sessions</p>
            <p className="stat-number">{stats.activeSessions}</p>
          </div>
        </div>

        {/* --- Charts Side by Side --- */}
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

        {/* --- AI Tips --- */}
        <h3 className="section-title">AI-Generated Tips</h3>
        <div className="tips-cards">
          {tips.map(tip => (
            <div key={tip.id} className="tip-card">
              <p className="tip-title">{tip.title}</p>
              <p className="tip-description">{tip.description}</p>
            </div>
          ))}
        </div>

        {/* --- Recent Prescriptions --- */}
        <h3 className="section-title">Recent Prescriptions</h3>
        <div className="prescriptions-table-wrapper">
          <table className="prescriptions-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Uploaded At</th>
                <th>Analysis</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p.id}>
                  <td className="prescription-participant">{p.user?.phone || "N/A"}</td>
                  <td className="prescription-date">{new Date(p.timestamp).toLocaleString()}</td>
                  <td className="prescription-analysis">{p.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

