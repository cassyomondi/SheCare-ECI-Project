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
  ResponsiveContainer
} from "recharts";

function UserGrowthTimeline({ apiUrl }) {
  const [roleData, setRoleData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState(true);

  // Colors for each role and total
  const roleColors = {
    participant: '#e74c3c',    // Red
    practitioner: '#3498db',   // Blue  
    admin: '#2ecc71',          // Green
    total: '#9b59b6'           // Purple for total
  };

  useEffect(() => {
    axios.get(apiUrl)
      .then((res) => {
        const users = res.data;
        
        // Process data to get role trends over time
        const timelineData = processRoleTimelineData(users);
        setRoleData(timelineData);
        setFilteredData(timelineData);
        
        // Set default date range (last 30 days)
        if (timelineData.length > 0) {
          const defaultStartDate = timelineData[timelineData.length - 30]?.date || timelineData[0].date;
          const defaultEndDate = timelineData[timelineData.length - 1].date;
          setDateRange({
            startDate: defaultStartDate,
            endDate: defaultEndDate
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiUrl]);

  // Process user data to create role-specific timeline
  const processRoleTimelineData = (users) => {
    const dateRoleCounts = {};
    
    // Initialize structure for each date
    users.forEach(user => {
      if (user.created_at) {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        if (!dateRoleCounts[date]) {
          dateRoleCounts[date] = {
            date: date,
            participant: 0,
            practitioner: 0,
            admin: 0,
            total: 0,
            formattedDate: new Date(date).toLocaleDateString()
          };
        }
        dateRoleCounts[date][user.role] = (dateRoleCounts[date][user.role] || 0) + 1;
        dateRoleCounts[date].total += 1;
      }
    });

    // Convert to array and calculate cumulative counts for each role
    const sortedDates = Object.keys(dateRoleCounts).sort();
    
    let cumulativeParticipants = 0;
    let cumulativePractitioners = 0;
    let cumulativeAdmins = 0;
    let cumulativeTotal = 0;

    const timelineData = sortedDates.map(date => {
      const dailyData = dateRoleCounts[date];
      
      cumulativeParticipants += dailyData.participant;
      cumulativePractitioners += dailyData.practitioner;
      cumulativeAdmins += dailyData.admin;
      cumulativeTotal += dailyData.total;

      return {
        ...dailyData,
        cumulativeParticipants,
        cumulativePractitioners,
        cumulativeAdmins,
        cumulativeTotal,
        totalUsers: cumulativeTotal
      };
    });

    return timelineData;
  };

  // Filter data based on date range
  const handleDateFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setFilteredData(roleData);
      return;
    }

    const filtered = roleData.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
  };

  // Reset to show all data
  const handleResetFilter = () => {
    setFilteredData(roleData);
    setDateRange({
      startDate: roleData[0]?.date || "",
      endDate: roleData[roleData.length - 1]?.date || ""
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading role timeline data...</div>;
  }

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
        User Role Growth Timeline
      </h3>

      {/* Date Picker Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#7f8c8d' }}>📅</span>
          <label style={{ fontSize: '14px', color: '#7f8c8d' }}>From:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ 
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#7f8c8d' }}>To:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ 
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          onClick={handleDateFilter}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Apply Filter
        </button>

        <button
          onClick={handleResetFilter}
          style={{
            padding: '8px 16px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Show All Data
        </button>

        <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
          {filteredData.length} days • {filteredData[filteredData.length - 1]?.totalUsers || 0} total users
        </div>
      </div>

      {/* Four-Line Chart for Role Growth + Total */}
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              const roleNames = {
                cumulativeParticipants: 'Participants',
                cumulativePractitioners: 'Practitioners', 
                cumulativeAdmins: 'Admins',
                cumulativeTotal: 'Total Users',
                participant: 'New Participants',
                practitioner: 'New Practitioners',
                admin: 'New Admins',
                total: 'New Users Total'
              };
              return [value, roleNames[name] || name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          
          {/* Total Users Line (thicker and dashed for emphasis) */}
          <Line 
            type="monotone" 
            dataKey="cumulativeTotal" 
            stroke={roleColors.total}
            strokeWidth={4}
            strokeDasharray="5 5"
            name="Total Users"
            dot={{ fill: roleColors.total, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 8 }}
          />
          
          {/* Cumulative Role Lines */}
          <Line 
            type="monotone" 
            dataKey="cumulativeParticipants" 
            stroke={roleColors.participant}
            strokeWidth={3}
            name="Participants"
            dot={{ fill: roleColors.participant, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="cumulativePractitioners" 
            stroke={roleColors.practitioner}
            strokeWidth={3}
            name="Practitioners"
            dot={{ fill: roleColors.practitioner, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="cumulativeAdmins" 
            stroke={roleColors.admin}
            strokeWidth={3}
            name="Admins"
            dot={{ fill: roleColors.admin, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Role Statistics Summary */}
      {filteredData.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '15px', 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ecf0f1',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', borderLeft: `4px solid ${roleColors.total}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Total Users</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: roleColors.total }}>
              {filteredData[filteredData.length - 1].cumulativeTotal}
            </div>
            <div style={{ fontSize: '11px', color: '#95a5a6' }}>
              +{filteredData[filteredData.length - 1].cumulativeTotal - filteredData[0].cumulativeTotal} growth
            </div>
          </div>
          
          <div style={{ textAlign: 'center', borderLeft: `4px solid ${roleColors.participant}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Participants</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: roleColors.participant }}>
              {filteredData[filteredData.length - 1].cumulativeParticipants}
            </div>
            <div style={{ fontSize: '11px', color: '#95a5a6' }}>
              +{filteredData[filteredData.length - 1].cumulativeParticipants - filteredData[0].cumulativeParticipants} growth
            </div>
          </div>
          
          <div style={{ textAlign: 'center', borderLeft: `4px solid ${roleColors.practitioner}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Practitioners</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: roleColors.practitioner }}>
              {filteredData[filteredData.length - 1].cumulativePractitioners}
            </div>
            <div style={{ fontSize: '11px', color: '#95a5a6' }}>
              +{filteredData[filteredData.length - 1].cumulativePractitioners - filteredData[0].cumulativePractitioners} growth
            </div>
          </div>
          
          <div style={{ textAlign: 'center', borderLeft: `4px solid ${roleColors.admin}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Administrators</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: roleColors.admin }}>
              {filteredData[filteredData.length - 1].cumulativeAdmins}
            </div>
            <div style={{ fontSize: '11px', color: '#95a5a6' }}>
              +{filteredData[filteredData.length - 1].cumulativeAdmins - filteredData[0].cumulativeAdmins} growth
            </div>
          </div>
        </div>
      )}

      {/* Growth Percentage Breakdown */}
      {filteredData.length > 0 && (
        <div style={{ 
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '14px' }}>Growth Distribution</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { 
                role: 'Participants', 
                value: filteredData[filteredData.length - 1].cumulativeParticipants - filteredData[0].cumulativeParticipants,
                color: roleColors.participant 
              },
              { 
                role: 'Practitioners', 
                value: filteredData[filteredData.length - 1].cumulativePractitioners - filteredData[0].cumulativePractitioners,
                color: roleColors.practitioner 
              },
              { 
                role: 'Admins', 
                value: filteredData[filteredData.length - 1].cumulativeAdmins - filteredData[0].cumulativeAdmins,
                color: roleColors.admin 
              }
            ].map((item, index) => {
              const totalGrowth = filteredData[filteredData.length - 1].cumulativeTotal - filteredData[0].cumulativeTotal;
              const percentage = totalGrowth > 0 ? ((item.value / totalGrowth) * 100).toFixed(1) : 0;
              
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '5px 10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: item.color,
                    borderRadius: '2px'
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#7f8c8d' }}>{item.role}:</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {item.value} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserGrowthTimeline;