import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Main from "./components/Main";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import UserDashboard from "./pages/UserDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  // Hydrate from localStorage
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    setLoading(false);
    return;
  }

  axios.get(`${import.meta.env.VITE_API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => setUser(res.data))
  .catch(() => localStorage.removeItem("token"))
  .finally(() => setLoading(false));
  }, []);


  const handleSetUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  if (loading) return <div>Loading...</div>; // wait for hydration

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/signin" element={<SignIn setUser={handleSetUser} />} />
        <Route path="/signup" element={<SignUp setUser={handleSetUser} />} />
        <Route
          path="/user-dashboard"
          element={user ? <UserDashboard user={user} /> : <Navigate to="/signin" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
