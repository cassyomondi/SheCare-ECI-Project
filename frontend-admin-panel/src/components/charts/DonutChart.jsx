import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function UserRoleDoughnutChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersResponse = await axios.get("http://127.0.0.1:5555/api/users");
        const users = usersResponse.data;

        const totalParticipants = users.filter(u => u.role === "participant").length;
        const totalPractitioners = users.filter(u => u.role === "practitioner").length;

        const associatesResponse = await axios.get("http://127.0.0.1:5555/api/associates");
        const totalAssociates = associatesResponse.data.length;

        setData([
          { name: "Participants", value: totalParticipants },
          { name: "Practitioners", value: totalPractitioners },
          { name: "Associates", value: totalAssociates }
        ]);
      } catch (error) {
        console.error("Error fetching data for doughnut chart:", error);
      }
    }

    fetchData();
  }, []);

  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h2>User Role Distribution</h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60} 
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UserRoleDoughnutChart;
