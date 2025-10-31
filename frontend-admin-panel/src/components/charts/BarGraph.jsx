import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function BarGraph({ title, apiUrl, barColor }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((res) => {
        const users = res.data;

        // Count roles
        const participantsCount = users.filter(u => u.role === "participant").length;
        const practitionersCount = users.filter(u => u.role === "practitioner").length;
        const adminsCount = users.filter(u => u.role === "admin").length;

        // Prepare chart data
        setChartData([
          { userType: "Participants", count: participantsCount },
          { userType: "Practitioners", count: practitionersCount },
          { userType: "Admins", count: adminsCount },
        ]);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setChartData([]);
      });
  }, [apiUrl]);

  return (
    <div style={{ width: "100%", height: "350px", marginBottom: "40px" }}>
      <h3 style={{color:"black"}}>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="userType" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarGraph;
