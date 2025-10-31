import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import About from "./components/About";
import LoginForm from "./components/Loginform";
import SignupForm from "./components/Signupform";
import UserDashboard from "./pages/UserDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  // Hydrate from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false); // Finished loading
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  if (loading) return <div>Loading...</div>; // wait for hydration

  return (
    <Router>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/login" element={<LoginForm setUser={handleSetUser} />} />
        <Route path="/signup" element={<SignupForm setUser={handleSetUser} />} />
        <Route
          path="/user-dashboard"
          element={user ? <UserDashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
