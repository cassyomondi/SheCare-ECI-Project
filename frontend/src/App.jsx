import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";  // Correct path
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Tips from "./pages/Tips";
import Prescriptions from "./pages/Prescriptions";
import Settings from "./pages/Settings";
import './App.css';

function App() {
  return (
    <Router>
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;