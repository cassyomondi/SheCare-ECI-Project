import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import Sidebar from '../components/layout/Sidebar';
import '../styles/Tips.css';
import Searchbar from '../components/forms/Searchbar';


function Tips() {
  const [tips, setTips] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [metrics, setMetrics] = useState({
    totalTips: 0,
    activeTips: 0,
    monthlyTipsSent: 0,
    verificationRate: 0,
    pendingVerification: 0,
    averageVerificationTime: 0, 
    rejectionRate: 0 
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(function() {
    fetchTips();
  }, []);

  useEffect(function() {
    calculateMetrics();
    filterTipsByDate();
  }, [tips, selectedDate, searchQuery]);
  async function fetchTips() {
    try {
      const response = await axios.get('http://127.0.0.1:5555/api/tips');
      setTips(response.data);
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
      }
  }
      
  

  function calculateMetrics() {
    if (tips.length === 0) return;
    const totalTips = tips.length;
    const activeTips = tips.filter(tip => tip.status === true).length;
        
        // Calculate monthly tips sent (tips created this month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTipsSent = tips.filter(tip => {
      const tipDate = new Date(tip.timestamp);
      return tipDate.getMonth() === currentMonth && tipDate.getFullYear() === currentYear;
    }).length;

        // Calculate verification rate (tips with verified_timestamp)
    const verifiedTips = tips.filter(tip => tip.status === true).length;
    const verificationRate = totalTips > 0 ? Math.round((verifiedTips / totalTips) * 100) : 0;
    const pendingVerification = tips.filter(tip => !tip.status && !tip.rejected).length;
    const rejectedTips = tips.filter(tip => tip.rejected).length;
    const rejectionRate = totalTips > 0 ? Math.round((rejectedTips / totalTips) * 100) : 0;
    
    setMetrics({
      totalTips,
      activeTips,
      monthlyTipsSent,
      verificationRate,
      pendingVerification,
      rejectionRate
    });
  };

  function filterTipsByDate() {
    let filtered = tips;
    
    if (selectedDate) {
      filtered = filtered.filter(tip => {
        const tipDate = new Date(tip.timestamp).toISOString().split('T')[0];
        return tipDate === selectedDate;
      });
    }
  
  // Apply search filter - ONLY title and category
    if (searchQuery) {
      filtered = filtered.filter(tip =>
        (tip.title && tip.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tip.category && tip.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredTips(filtered);
  }

  

  function handleDateChange(event) {
    setSelectedDate(event.target.value);
  }
  
  function clearDateFilter() {
    setSelectedDate('');
  }

  function getCategoryData() {
    const categoryCount = {};
    tips.forEach((tip) => {
      const category = tip.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count)
  }

  
  function getTimelineData() {
    const timelineData = {};
    
    tips.forEach(tip => {
      const date = new Date(tip.timestamp).toISOString().split('T')[0];
      timelineData[date] = (timelineData[date] || 0) + 1;
    });
    
    return Object.entries(timelineData)
    .map(([date, count]) => ({
      date,
      count
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30); // Last 30 days
  }
  function getStatusData() {
    const statusCount = {
      active: tips.filter(tip => tip.status === true).length,
      inactive: tips.filter(tip => tip.status === false).length
    };
    return statusCount;
  }
  function handleSearch(query) {
    setSearchQuery(query);
  }
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getPractitionerData() {
    const practitionerStats = {};
  
    tips.forEach((tip) => {
      const practitioner = tip.practitioner || 'Unknown';
      if (!practitionerStats[practitioner]) {
        practitionerStats[practitioner] = {
          verifications: 0,
          rejections: 0,
          avgVerificationTime: 0
        };
      }
      practitionerStats[practitioner].verifications++;
      if (tip.rejected) {
        practitionerStats[practitioner].rejections++;
      }
    });
    return Object.entries(practitionerStats).map(([name, stats]) => ({
      name,
      count: stats.verifications,
      rejections: stats.rejections,
      approvalRate: Math.round(((stats.verifications - stats.rejections) / stats.verifications) * 100) || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  }

  function getWorkflowData() {
    return {
      pending: tips.filter(tip => !tip.status && !tip.rejected).length,
      approved: tips.filter(tip => tip.status === true).length,
      rejected: tips.filter(tip => tip.rejected).length,
      needsRevision: tips.filter(tip => tip.needs_revision).length // if you track this
    };
  }



  if (loading) {
    return <div className="tips-loading">Loading tips analytics...</div>;
  }
  const categoryData = getCategoryData();
  const practitionerData = getPractitionerData();
  const timelineData = getTimelineData(); 
  const statusData = getStatusData();
  const workflowData = getWorkflowData();
  


  return (
    
  <div className="tips-container">
    
    <div className="tips-header">
      <h1 className="tips-title">Tips Analytics</h1>
      <p className="tips-subtitle">Overview of tips performance and metrics</p>
    </div>

    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon total-tips-icon">📊</div>
        <div className="metric-content">
          <h3 className="metric-title">Total Tips</h3>
          <div className="metric-value">{metrics.totalTips}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon active-tips-icon">✅</div>
        <div className="metric-content">
          <h3 className="metric-title">Active Tips</h3>
          <div className="metric-value">{metrics.activeTips}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon monthly-icon">📅</div>
        <div className="metric-content">
          <h3 className="metric-title">Sent This Month</h3>
          <div className="metric-value">{metrics.monthlyTipsSent}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon verification-icon">🔍</div>
        <div className="metric-content">
          <h3 className="metric-title">Active Rate</h3>
          <div className="metric-value">{metrics.verificationRate}%</div>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon pending-icon">⏳</div>
        <div className="metric-content">
          <h3 className="metric-title">Pending Verification</h3>
          <div className="metric-value">{metrics.pendingVerification}</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon rejection-icon">🚫</div>
        <div className="metric-content">
          <h3 className="metric-title">Rejection Rate</h3>
          <div className="metric-value">{metrics.rejectionRate}%</div>
        </div>
      </div>

    </div>
    <div className="table-section">
      <div className="table-header">
        <h2 className="table-title">All Tips</h2>
        <div className="filters-container">
          <div className="search-filter">
            <Searchbar  onSearch={handleSearch} placeholder={"Search by title or category..."}/>
          </div>
          <div className="date-filter">
            <label htmlFor="date-picker">Filter by Date:</label>
            <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-input"
            />
            {selectedDate && (
              <button onClick={clearDateFilter} className="clear-filter-btn">
                Clear Date
              </button>
            )}
          </div>
        </div>
        
      </div>
      {(searchQuery || selectedDate) && (
        <div className="search-results-info">
          <p>
            Showing {filteredTips.length} tips
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedDate && ` from ${selectedDate}`}
          </p>
          {(searchQuery || selectedDate) && (
            <button onClick={() => {setSearchQuery('');setSelectedDate('');}} className="clear-all-btn">
              Clear All Filters
            </button>
          )}
        </div>
      )}

      <div className="table-container">
        <table className="tips-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Practitioner</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTips.map((tip) => (
              <tr key={tip.id}>
                <td className="tip-id">{tip.id}</td>
                <td className="tip-title">{tip.title}</td>
                <td className="tip-description">{tip.description}</td>
                <td className="tip-practitioner">{tip.practitioner}</td>
                <td className="tip-status">
                  {tip.status ? (
                    <span className="status-badge status-active">Active</span>
                  ) : (
                    <span className="status-badge status-inactive">Inactive</span>
                  )}
                </td>
                <td className="tip-date">{formatDate(tip.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTips.length === 0 && selectedDate && (
          <div className="no-results">No tips found for the selected date.</div>
        )}
      </div>
    </div>

    <div className="charts-section">
      <h2 className="section-title">Tips Analysis</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Tips by Category</h3>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <div className="bar-chart">
                {categoryData.map((item) => (
                  <div key={item.name} className="bar-item">
                    <div className="bar-label">{item.name}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(...categoryData.map((d) => d.count))) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="bar-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No category data available</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Tip Verifiers</h3>
          <p className="chart-subtitle">Medical oversight for AI-generated content</p>
          <div className="chart-container">
            {practitionerData.length > 0 ? (
              <div className="bar-chart">
                {practitionerData.map((item) => (
                  <div key={item.name} className="bar-item">
                    <div className="bar-label">
                      {item.name}
                      <div className="practitioner-stats">
                        <span className="approval-rate">{item.approvalRate}% approved</span>
                        {item.rejections > 0 &&(
                          <span className="rejection-count">({item.rejections} rejected)</span>
                        )}
                      </div>
                      
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill practitioner-bar"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(...practitionerData.map((d) => d.count))) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="bar-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No verification data available</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Tip Workflow Status</h3>
          <div className="chart-container">
            <div className="workflow-chart">
              <div className="workflow-item pending">
                <span className="workflow-label">⏳ Pending Review</span>
                <span className="workflow-value">{workflowData.pending}</span>
              </div>
              <div className="workflow-item approved">
                <span className="workflow-label">✅ Approved</span>
                <span className="workflow-value">{workflowData.approved}</span>
              </div>
              <div className="workflow-item rejected">
                <span className="workflow-label">🚫 Rejected</span>
                <span className="workflow-value">{workflowData.rejected}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Timeline Chart */}
        <div className="chart-card timeline-card">
          <h3 className="chart-title">Tips Timeline (Last 30 Days)</h3>
          <div className="chart-container">
            {timelineData.length > 0 ? (
              <div className="timeline-chart">
                {timelineData.map((item, index) => (
                  <div key={item.date} className="timeline-item">
                    <div className="timeline-bar">
                      <div 
                        className="timeline-fill"
                        style={{ 
                          height: `${(item.count / Math.max(...timelineData.map(d => d.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="timeline-label">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="timeline-value">{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No timeline data available</div>
            )}
          </div>
        </div>
        {/* Status Distribution Chart */}
        <div className="chart-card status-card">
          <h3 className="chart-title">Tips Status</h3>
          <div className="chart-container">
            {tips.length > 0 ? (
              <div className="status-chart">
                <div className="status-item">
                  <div className="status-dot active-dot"></div>
                  <div className="status-info">
                    <span className="status-label">Active</span>
                    <span className="status-value">{statusData.active}</span>
                  </div>
                  <div className="status-percent">
                    {Math.round((statusData.active / tips.length) * 100)}%
                  </div>
                </div>
                <div className="status-item">
                  <div className="status-dot inactive-dot"></div>
                  <div className="status-info">
                    <span className="status-label">Inactive</span>
                    <span className="status-value">{statusData.inactive}</span>
                  </div>
                  <div className="status-percent">
                    {Math.round((statusData.inactive / tips.length) * 100)}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No status data available</div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  </div>
  );

}

export default Tips;
