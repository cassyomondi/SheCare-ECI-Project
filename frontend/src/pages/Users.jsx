import React, {useEffect, useState} from "react";
import axios from "axios";
import UserRoleDoughnutChart from "../components/charts/DonutChart";
import UserTrendsInsight from "../components/charts/UserGrowthTimeline";
import "../styles/Users.css";
import UserGrowthTimeline from "../components/charts/UserGrowthTimeline";
import Searchbar from "../components/forms/Searchbar";


function Users() {
  const[stats, setStats]=useState({
    totalParticipants:0,
    totalPractitioners:0
  
  });
  const [associates, setAssociates] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);


  function handleSearch(query){
  setSearchQuery(query);
  };

  // Search functionality
  const filteredUsers = searchQuery ? users.filter(user =>
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
    ): users;


  useEffect(()=>{
    axios.get("http://127.0.0.1:5555/api/users")
    .then(res=>{
      const usersData = res.data;
      setUsers(usersData); 
      console.log("User data structure:", usersData[0])
      setStats({
        totalParticipants:usersData.filter(u => u.role === "participant").length, // CHANGE: users to usersData
        totalPractitioners:usersData.filter(u=> u.role==="practitioner").length // CHANGE: users to usersData
      });
    })
   
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
      <div className="users-header">
        <h1>Users Management</h1>
        <p>Monitor User Statistics</p>
        <Searchbar onSearch={handleSearch} placeholder={"Search users by name, role..."}/>
        {searchQuery &&(
          <div className="search-results-info">
            <p>Found {filteredUsers.length} users matching "{searchQuery}"</p>
          </div>
        )}
      </div>
      
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
      {searchQuery && filteredUsers.length > 0 && (
        <div className="users-search-results">
          <h3>Matching Users</h3>
          <div className="users-list">
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card">
              <h4>{user.name || 'Unknown Name'}</h4>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ))}
          </div>
        </div>
    )}
      
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
