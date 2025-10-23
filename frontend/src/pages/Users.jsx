import React, {useEffect, useState} from "react";
import axios from "axios";
import UserRoleDoughnutChart from "../components/charts/DonutChart";
import UserTrendsInsight from "../components/charts/UserGrowthTimeline";
import "../styles/Users.css";
import UserGrowthTimeline from "../components/charts/UserGrowthTimeline";



function Users() {
  const[stats, setStats]=useState({
    totalParticipants:0,
    totalPractitioners:0
  
  });
  const [associates, setAssociates] = useState(0);
  useEffect(()=>{
    axios.get("http://127.0.0.1:5555/api/users")
    .then(res=>{
      const users=res.data;
      setStats({
        totalParticipants:users.filter(u => u.role === "participant").length,
        totalPractitioners:users.filter(u=> u.role==="practitioner").length

    });
    
    })
    .catch(error => console.log("Error fetching users:", error));
    axios.get("http://127.0.0.1:5555/api/associates")
    .then(res=>{
      const Asso=res.data;
      setAssociates(
        Asso.length
      );
      
    })
    .catch(error => console.log("Error fetching associates:", error));
  }, []);


  return (
    <div className="users-container">
      <h1>Users Management</h1>
      <p>Monitor User Statistics</p>
      <div className="summary-card">
        <div className="card">
          <p className="card-title"> Total participants</p>
          <h2>{stats.totalParticipants}</h2>
     
        </div>
        <div className="card">
          <p className="card-title">Total Users</p>
          <h2>{stats.totalPractitioners}</h2>
        </div>
        <div className="card">
          <p className="card-title">Total Associates</p>
          <h2>{associates}</h2>

      </div>
     </div>
     <br />
      <UserRoleDoughnutChart />
      <br />
      <br />
      <UserGrowthTimeline  apiUrl="http://127.0.0.1:5555/api/users"/>
      
      
      
    </div>
  );
}

export default Users;
