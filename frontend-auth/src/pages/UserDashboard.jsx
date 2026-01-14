import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/"; // not logged in
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
  }, []);

  if (loading) return <div className="dashboard-overlay">Loading…</div>;

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-card">
        <img
          src="https://shecare-nu.vercel.app/images/logo.png"
          alt="SheCare Logo"
          className="dashboard-logo"
        />

        <h1>Welcome {user.email}</h1>
        <p className="dashboard-subtext">We're glad to have you here.</p>

        <a
          href="https://wa.me/+14155238886"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          Chat with SheCare on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default UserDashboard;
