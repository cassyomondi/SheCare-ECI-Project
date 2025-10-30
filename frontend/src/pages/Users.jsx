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
  const [showUsersTable, setShowUsersTable] = useState(false);
  


  function handleSearch(query){
  setSearchQuery(query);
  };

  // Search functionality
  const filteredUsers = searchQuery ? users.filter(user =>
      (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase()))||
      (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
    ): users;


  useEffect(()=>{
    Promise.all([
      axios.get("http://127.0.0.1:5555/api/participants"),
      axios.get("http://127.0.0.1:5555/api/practitioners"), 
      axios.get("http://127.0.0.1:5555/api/admins")
    ])
    .then(([participantsRes, practitionersRes, adminsRes]) => {
    // Combine all users and add role information
      const allUsers = [
        ...participantsRes.data.map(user => ({ ...user, role: 'participant' })),
        ...practitionersRes.data.map(user => ({ ...user, role: 'practitioner' })),
        ...adminsRes.data.map(user => ({ ...user, role: 'admin' }))
      ];
    
      setUsers(allUsers);
      console.log("All users data:", allUsers);
    
      setStats({
        totalParticipants: participantsRes.data.length,
        totalPractitioners: practitionersRes.data.length,
        totalAdmins: adminsRes.data.length
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
      {searchQuery && filteredUsers.length > 0 && (
        <div className="users-search-results">
          <h3>Matching Users</h3>
          <div className="users-list">
            {filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <h4>{user.first_name} {user.last_name}</h4>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      
      <div className="summary-card">
        <div className="card">
          <p className="card-title"> Total Participants</p>
          <h2>{stats.totalParticipants}</h2>
        </div>
        <div className="card">
          <p className="card-title">Total Practitioners</p>
          <h2>{stats.totalPractitioners}</h2>
        </div>
        <div className="card">
          <p className="card-title">Total Associates</p>
          <h2>{associates}</h2>
        </div>
      </div>

      {/* View All Users Toggle */}
      <div className="view-users-section">
        <button 
          className="view-users-btn"
          onClick={() => setShowUsersTable(!showUsersTable)}
        >
          {showUsersTable ? '▲ Hide All Users' : '▼ View All Users'}
        </button>
        
        {showUsersTable && (
          <div className="users-table-section">
            <h2>All Users</h2>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Age</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.age || '-'}</td>
                      <td>{user.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      
      <br />
      <UserRoleDoughnutChart />
      <br />
      <br />
      <UserGrowthTimeline apiUrl="http://127.0.0.1:5555/api/users"/>
    </div>
  );
}

export default Users;
