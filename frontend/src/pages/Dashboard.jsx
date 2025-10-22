import React from "react";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import "../styles/Dashboard.css";
import Searchbar from "../components/forms/Searchbar.jsx";
import BarGraph from "../components/charts/BarGraph.jsx";
import LineGraph from "../components/charts/LineGraph.jsx";


function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-header">
          <Header title="Dashboard" showAvatar={true} showNotification={true} />
        <Searchbar />
        </div>
        <LineGraph
        apiUrl=""/>
        <BarGraph 
        title="Participants Growth"
        apiUrl=""
        barColor="#F4F4F4"
        />
        <BarGraph 
        title="Practioners Growth"
        apiUrl=""
        barColor="black"/>
     
        
      </div>
    </div>
  );
}

export default Dashboard;
