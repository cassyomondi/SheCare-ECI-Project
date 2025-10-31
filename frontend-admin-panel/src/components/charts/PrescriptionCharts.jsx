import React from 'react';


function PrescriptionCharts({ prescriptions }) {
  // Chart 1: Prescriptions timeline (last 30 days)
  const getTimelineData = () => {
    const timelineData = {};
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last30Days.forEach(date => {
      timelineData[date] = prescriptions.filter(p => 
        p.timestamp && p.timestamp.startsWith(date)
      ).length;
    });

    return Object.entries(timelineData).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    }));
  };

  // Chart 2: Token usage distribution
  const getTokenData = () => {
    const inputTokens = prescriptions.reduce((sum, p) => sum + (parseInt(p.input_token) || 0), 0);
    const outputTokens = prescriptions.reduce((sum, p) => sum + (parseInt(p.output_token) || 0), 0);
    
    return [
      { name: 'Input Tokens', value: inputTokens, color: '#6C63FF' },
      { name: 'Output Tokens', value: outputTokens, color: '#FF6584' }
    ];
  };

  const timelineData = getTimelineData();
  const tokenData = getTokenData();

  return (
    <div className="prescription-charts">
      <h3>Prescriptions Analytics</h3>
      
      {/* Timeline Chart */}
      <div className="chart-card">
        <h4>Prescriptions Timeline (Last 30 Days)</h4>
        <div className="timeline-chart">
          {timelineData.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-bar">
                <div 
                  className="timeline-fill"
                  style={{ 
                    height: `${(item.count / Math.max(...timelineData.map(d => d.count || 1)) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="timeline-label">{item.date}</div>
              <div className="timeline-value">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Usage Chart */}
      <div className="chart-card">
        <h4>Token Usage Distribution</h4>
        <div className="token-chart">
          {tokenData.map((item, index) => (
            <div key={index} className="token-item">
              <div className="token-info">
                <div 
                  className="token-color" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="token-label">{item.name}</span>
              </div>
              <div className="token-value">{item.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Length Chart */}
      <div className="chart-card">
        <h4>Response Length Analysis</h4>
        <div className="response-chart">
          <div className="response-stats">
            <div className="stat-item">
              <span className="stat-label">Average Length: </span>
              <span className="stat-value">
                {prescriptions.length > 0 
                  ? Math.round(prescriptions.reduce((sum, p) => sum + (p.response?.length || 0), 0) / prescriptions.length)
                  : 0
                } chars
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Longest Response: </span>
              <span className="stat-value">
                {Math.max(...prescriptions.map(p => p.response?.length || 0))} chars
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionCharts;