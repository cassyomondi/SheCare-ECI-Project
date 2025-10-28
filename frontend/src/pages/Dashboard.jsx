
import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header.jsx";
//mport Sidebar from "../components/layout/Sidebar.jsx";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User", // Default fallback
    email: "admin@healthcare.com",
    role: "Administrator",
    lastLogin: new Date().toLocaleDateString(),
  });
  
  function handleSearch(query){
    setSearchQuery(query);
  };

  useEffect(() => {
    // Fetch stats
    axios.get("http://127.0.0.1:5555/api/users")
      .then(res => {
        const usersData = res.data;
        setUsers(usersData);
        setStats({
          totalUsers: usersData.length,
          totalParticipants: usersData.filter(u => u.role === "participant").length,
          totalPractitioners: usersData.filter(u => u.role === "practitioner").length,
          activeSessions: usersData.filter(u => u.chat_sessions && u.chat_sessions.length > 0).length,
        });
        const adminUser = usersData.find(user => user.role === "admin");

        if (adminUser){
          setAdminProfile({
            name: "Admin User",
            email: adminUser.email || "admin@healthcare.com",
            role: "Administrator",
            lastLogin: new Date().toLocaleDateString(),
          });  
        }else{
          setAdminProfile({
            name: "Admin User",
            email: "admin@healthcare.com", 
            role: "Administrator",
            lastLogin: new Date().toLocaleDateString(),
          });
        }
      })
      .catch(error => {
        console.log("Error fetching admin profile:", error);
      // Keep the default values if API fails
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

  // Search functionality
  const searchEverything = (query) => {
    if (!query.trim()) return [];
    
    const results = [];
    const searchTerm = query.toLowerCase();
    
    // Search users
    users.forEach(user => {
      if (
        (user.name && user.name.toLowerCase().includes(searchTerm)) || 
        (user.email && user.email.toLowerCase().includes(searchTerm)) || 
        (user.role && user.role.toLowerCase().includes(searchTerm))
      ) {
        results.push({ type: 'user', data: user });
      }
    });
    
    // Search tips  
    tips.forEach(tip => {
      if (
        (tip.title && tip.title.toLowerCase().includes(searchTerm)) || 
        (tip.description && tip.description.toLowerCase().includes(searchTerm)) ||
        (tip.category && tip.category.toLowerCase().includes(searchTerm))
      ) {
        results.push({ type: 'tip', data: tip });
      }
    });

    // Search prescription stats
    if (
      String(prescriptionStats.total).includes(searchTerm) || 
      (prescriptionStats.mostCommon && prescriptionStats.mostCommon.toLowerCase().includes(searchTerm)) ||
      searchTerm.includes('prescription')
    ) {
      results.push({ 
        type: 'prescription_stat', 
        data: { 
          total: prescriptionStats.total, 
          mostCommon: prescriptionStats.mostCommon 
        } 
      });
    }

    // Search stats by numbers or keywords
    if (String(stats.totalUsers).includes(searchTerm) || searchTerm.includes('user')) {
      results.push({ type: 'stat', data: { key: 'Total Users', value: stats.totalUsers } });
    }
    if (String(stats.totalParticipants).includes(searchTerm) || searchTerm.includes('participant')) {
      results.push({ type: 'stat', data: { key: 'Total Participants', value: stats.totalParticipants } });
    }
    if (String(stats.totalPractitioners).includes(searchTerm) || searchTerm.includes('practitioner')) {
      results.push({ type: 'stat', data: { key: 'Total Practitioners', value: stats.totalPractitioners } });
    }
    if (String(stats.activeSessions).includes(searchTerm) || searchTerm.includes('session')) {
      results.push({ type: 'stat', data: { key: 'Active Sessions', value: stats.activeSessions } });
    }
    
    return results;
  };

  const searchResults = searchQuery ? searchEverything(searchQuery) : [];

  console.log("Dashboard is rendering");
  console.log("Users data for search:", users);
  console.log("Tips data for search:", tips);
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <Header title="Dashboard" showAvatar={true} showNotification={true} />
          <Searchbar onSearch={handleSearch} placeholder={"Search users, tips, stats..."}/>
          {/* --- Add Admin Profile HERE --- */}
            <div className="admin-profile-section">
              <div className="admin-profile-card">
                <div className="admin-avatar">👨</div>
                <div className="admin-info">
                  <h2>{adminProfile.name}</h2>
                  <p className="admin-role">{adminProfile.role}</p>
                  <p className="admin-email">{adminProfile.email}</p>
                  <p className="admin-login">Last login: {adminProfile.lastLogin}</p>
                </div>
                
              </div>
            </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="search-results">
            <h2>Search Results for "{searchQuery}"</h2>
            {searchResults.length === 0 ? (
              <p>No results found. Try searching for: user names, tip titles, numbers, or categories.</p>
            ) : (
              <div>
                <p>Found {searchResults.length} results:</p>
                {searchResults.map((result, index) => (
                  <div key={index} className="result-card">
                    {result.type === 'user' && (
                      <div>
                        <h4>👤 User: {result.data.name || 'Unknown Name'}</h4>
                        <p><strong>Email:</strong> {result.data.email}</p>
                        <p><strong>Role:</strong> {result.data.role}</p>
                        <p><strong>ID:</strong> {result.data.id}</p>
                      </div>
                    )}
                    {result.type === 'tip' && (
                      <div>
                        <h4>💡 Tip: {result.data.title}</h4>
                        <p><strong>Description:</strong> {result.data.description}</p>
                        <p><strong>Category:</strong> {result.data.category}</p>
                        <p><strong>Date:</strong> {new Date(result.data.timestamp).toLocaleDateString()}</p>
                      </div>
                    )}
                    {result.type === 'stat' && (
                      <div>
                        <h4>📊 Statistic: {result.data.key}</h4>
                        <p><strong>Value:</strong> {result.data.value}</p>
                      </div>
                    )}
                    {result.type === 'prescription_stat' && (
                      <div>
                        <h4>💊 Prescription Statistics</h4>
                        <p><strong>Total Prescriptions:</strong> {result.data.total}</p>
                        <p><strong>Most Common:</strong> {result.data.mostCommon}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Normal Dashboard Content (only shown when not searching) */}
        {!searchQuery && (
          <>
            
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
          </>
        )}

      </div>
    </div>
  );
}

export default Dashboard;