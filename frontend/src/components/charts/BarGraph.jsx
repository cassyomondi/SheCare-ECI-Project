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
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(apiUrl)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [apiUrl]);

  return (
    <div style={{ width: "100%", height: 350, marginBottom: "40px" }}>
      <h3>{title}</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarGraph;
