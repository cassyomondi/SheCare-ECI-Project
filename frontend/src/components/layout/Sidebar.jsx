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
              Tips
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/prescriptions" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Prescriptions
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;