import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/Sidebar.css";  // Updated path - go up two levels

function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870"
              alt="Dashboard icon"
              height="10px"
              width="10px"
              /> 
               Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/users" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <img 
              src="https://plus.unsplash.com/premium_photo-1684225765349-072e1a35afc6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1032"
              alt="users"
              height="10px"
              width="10px"/>
              Users
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/tips" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <img 
              src="https://plus.unsplash.com/premium_photo-1682275215669-92545e354db2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"
              alt="Tips"
              height="10px"
              width="10px"/>
              Tips
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/prescriptions" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <img 
              src="https://plus.unsplash.com/premium_photo-1668605108582-e7fa7dc2e195?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870"
              alt="Prescriptions"
              height="10px"
              width="10px"/>
              Prescriptions
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDgp53HKq4fyclYtZdD-0wHVV2YC2rZ0tmGg&s"
              alt="Settings"
              height="10px"
              width="10px"/>
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;