import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";  // Correct path
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Tips from "./pages/Tips";
import Prescriptions from "./pages/Prescriptions";
import Settings from "./pages/Settings";
import AdminRegistration from "./pages/AdminRegistration.jsx";
import { ThemeProvider } from './components/layout/ThemeContext.jsx'
import AdminInvite from "./pages/AdminInvite.jsx";
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* STANDALONE REGISTRATION - NO SIDEBAR */}
          <Route path="/admin-registration" element={<AdminRegistration />} />
          
          {/* 📊 YOUR MAIN DASHBOARD APP - WITH SIDEBAR */}
          <Route path="/*" element={
            <div className="app-container">
              <Sidebar />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/tips" element={<Tips />} />
                  <Route path="/prescriptions" element={<Prescriptions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin-invite" element={<AdminInvite />} />
                </Routes>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
    
  );
}

export default App;