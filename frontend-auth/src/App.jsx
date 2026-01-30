import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Main from "./components/Main";
import UserDashboard from "./pages/UserDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import axios from "axios";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [user, setUser] = useState(null);

  // Loader control
  const [loading, setLoading] = useState(true);       // whether loader is mounted
  const [fadeLoader, setFadeLoader] = useState(false); // whether loader is fading out

  useEffect(() => {
    const FADE_MS = 180;

    const done = () => {
      // trigger fade animation
      setFadeLoader(true);

      // unmount loader after fade finishes
      window.setTimeout(() => {
        setLoading(false);
      }, FADE_MS);
    };

    const token = localStorage.getItem("token");
    if (!token) {
      done();
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(done);
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return <LoadingScreen label="Preparing SheCare..." fadingOut={fadeLoader} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main setUser={handleSetUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/user-dashboard"
          element={
            user ? (
              <UserDashboard user={user} setUser={handleSetUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
