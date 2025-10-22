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

function LineGraph({ apiUrl }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => console.error("Error fetching line graph data:", error));
  }, [apiUrl]);

  return (
    <div style={{ width: "100%", height: 350, marginBottom: "40px" }}>
      <h3>Users Trend (Participants, Practitioners, Associates)</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="participants" stroke="#6C63FF" name="Participants" />
          <Line type="monotone" dataKey="practitioners" stroke="#00C49F" name="Practitioners" />
          <Line type="monotone" dataKey="associates" stroke="#FFB100" name="Associates" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineGraph;
