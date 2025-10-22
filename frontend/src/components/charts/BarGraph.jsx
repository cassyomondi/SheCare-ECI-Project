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
        if (response.data.length === 0) {
          setData([
            { userType: "Participants", count: 50 },
            { userType: "Practitioners", count: 20 },
            { userType: "Associates", count: 15 }
          ]);
        } else {
          setData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData([
          { userType: "Participants", count: 50 },
          { userType: "Practitioners", count: 20 },
          { userType: "Associates", count: 15 }
        ]);
      });
  }, [apiUrl]);
   console.log("Chart Data:", data);


  return (
    <div style={{ width: "100%", height: "350Px", marginBottom: "40px" }}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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

export default BarGraph; // ✅ YES, YOU MUST EXPORT IT
