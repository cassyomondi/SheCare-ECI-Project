import React from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import "../styles/Dashboard.css";
import Searchbar from "../components/forms/Searchbar.jsx";
import BarGraph from "../components/charts/BarGraph.jsx";
import UserRoleTrend from "../components/charts/UserRoleTrend.jsx";


function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <Header title="Dashboard" showAvatar={true} showNotification={true} />
        <Searchbar />
        </div>
        
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
    </div>
  );
}

export default Dashboard;
