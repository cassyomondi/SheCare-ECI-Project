import React from "react";
import "../../styles/Sidebar.css";



function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <nav>
        <ul>
          <li>Dashboard</li>
          <li>Users
            <ul className="sub-menu">
              <li>Participants</li>
              <li>Practitioners</li>
              <li>Associates</li>
            </ul>
          </li>
          <li>Tips</li>
          <li>Prescriptions</li>
          <li>Settings</li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
