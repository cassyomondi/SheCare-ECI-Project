// src/components/charts/UserRoleTrend.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function UserRoleTrend({ title, apiUrl }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get(apiUrl)
      .then((res) => {
        const users = res.data;

        // Group users by date and role
        const grouped = {};
        users.forEach(u => {
          if (!u.created_at) return;
          const date = u.created_at.split("T")[0]; // YYYY-MM-DD
          if (!grouped[date]) grouped[date] = { date, participant: 0, practioner: 0, admin: 0 };
          const roleKey = u.role.toLowerCase();
          if (grouped[date][roleKey] !== undefined) grouped[date][roleKey] += 1;
        });

        // Convert object to sorted array
        const sortedData = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
        setChartData(sortedData);
      })
      .catch(err => {
        console.error("Error fetching user data:", err);
        setChartData([]);
      });
  }, [apiUrl]);

  return (
    <div style={{ width: "100%", height: 400, marginBottom: 40 }}>
      <h3 style={{ color: "#6C63FF" }}>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="participant" stroke="#1f77b4" />
          <Line type="monotone" dataKey="practioner" stroke="#ff7f0e" />
          <Line type="monotone" dataKey="admin" stroke="#2ca02c" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UserRoleTrend;
