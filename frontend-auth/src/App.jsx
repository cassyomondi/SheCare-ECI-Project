import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Main from "./components/Main";
import UserDashboard from "./pages/UserDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import axios from "axios";
import LoadingScreen from "./components/LoadingScreen"; // ✅ add

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const finishLoading = () =>
      setTimeout(() => setLoading(false), 20000); // 👈 3s delay

    if (!token) {
      finishLoading();
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(finishLoading);
  }, []);


  const handleSetUser = (userData) => {
    setUser(userData);
  };

  if (loading) return <LoadingScreen label="Preparing SheCare..." />; // ✅ replace

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main setUser={handleSetUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/user-dashboard"
          element={user ? <UserDashboard user={user} setUser={handleSetUser} /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
