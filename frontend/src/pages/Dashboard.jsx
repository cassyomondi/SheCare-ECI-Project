import React from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import "../styles/Dashboard.css";
import Searchbar from "../components/forms/Searchbar.jsx";
import BarGraph from "../components/charts/BarGraph.jsx";


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
        title="UserType Comparison"
        apiUrl="http://localhost:5000/api/user-totals"
        barColor="yellow"
        />
        
     
        
      </div>
    </div>
  );
}

export default Dashboard;
