import React, {useState, useEffect} from "react";
import axios from "axios";
import PrescriptionCharts from "../components/charts/PrescriptionCharts";
import PrescriptionFilters from "../components/forms/PrescriptionFilters";
import '../styles/Prescriptions.css'


function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');


  // Fetch prescriptions from the API
  useEffect(()=>{
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions=async()=>{
    try {
      const response = await axios.get("http://127.0.0.1:5555/api/prescriptions");
      setPrescriptions(response.data);
      setFilteredPrescriptions(response.data);
    } catch(error){
      console.log("Error fetching prescriptions:", error)
    } finally {
      setLoading(false);
    }
  };

  // Card metrics
  const calculateMetrics = () => {
    const dataToUse = dateFilter || searchQuery ? filteredPrescriptions : prescriptions;
    const totalPrescriptions = dataToUse.length;
    const totalInputTokens = dataToUse.reduce((sum, p) => sum + (parseInt(p.input_token) || 0), 0);
    const totalOutputTokens = dataToUse.reduce((sum, p) => sum + (parseInt(p.output_token) || 0), 0);
    const prescriptionsWithUpload = dataToUse.filter(p => p.uploaded).length;
    
    
    return {
      totalPrescriptions,
      totalInputTokens,
      totalOutputTokens,
      prescriptionsWithUpload
    };
  };

  const metrics = calculateMetrics();

  // handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, dateFilter);
  };

  const applyFilters = (query = searchQuery, date = dateFilter) => {
    let filtered = prescriptions;
  
  // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter(prescription =>
        prescription.response?.toLowerCase().includes(query.toLowerCase()) ||
        prescription.user_id?.toString().includes(query)
      );
    }
  
  // Apply date filter
    if (date) {
      filtered = filtered.filter(prescription => {
        const prescriptionDate = new Date(prescription.timestamp).toISOString().split('T')[0];
        return prescriptionDate === date;
      });
    }
  
    setFilteredPrescriptions(filtered);
  };
  const handleDateChange = (event) => {
    const date = event.target.value;
    setDateFilter(date);
    applyFilters(searchQuery, date);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const downloadUploadedFile = (prescription) => {
    if (prescription.uploaded) {
      // Create a blob and download link for the uploaded file
      const blob = new Blob([prescription.uploaded]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${prescription.id}.file`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <div className="loading">Loading prescriptions data...</div>;
  }

  return (
    <div className="prescriptions-container">
      {/*Header section */}
      <div className="prescriptions-header">
        <h1>Prescriptions</h1>
        <p>View and manage prescriptions.</p>
      </div>
      {/*Search and filter section*/}
      <PrescriptionFilters onSearch={handleSearch} onDateChange={handleDateChange} dateFilter={dateFilter} />

      {/* METRICS CARDS SECTION */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Total Prescriptions</h3>
            <div className="metric-value">{metrics.totalPrescriptions}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📥</div>
          <div className="metric-content">
            <h3>Input Tokens</h3>
            <div className="metric-value">{metrics.totalInputTokens}</div>
          </div>
        </div>
         <div className="metric-card">
          <div className="metric-icon">📤</div>
          <div className="metric-content">
            <h3>Output Tokens</h3>
            <div className="metric-value">{metrics.totalOutputTokens}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📎</div>
          <div className="metric-content">
            <h3>With Uploads</h3>
            <div className="metric-value">{metrics.prescriptionsWithUpload}</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Two column layout */}
      <div className="prescriptions-content">
        {/* LEFT COLUMN - Table */}
        <div className="table-section">
          <h2>All Prescriptions</h2>
          <div className="table-container">
            <table className="prescriptions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>AI Response Preview</th>
                  <th>Input Tokens</th>
                  <th>Output Tokens</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td className="prescription-id">{prescription.id}</td>
                    <td className="user-id">{prescription.user_id}</td>
                    <td className="response-preview">
                      {prescription.response 
                        ? `${prescription.response.substring(0, 50)}${prescription.response.length > 50 ? '...' : ''}`
                        : 'No response'
                      }
                    </td>
                    <td className="input-tokens">{prescription.input_token || '0'}</td>
                    <td className="output-tokens">{prescription.output_token || '0'}</td>
                    <td className="prescription-date">{formatDate(prescription.timestamp)}</td>
                    <td className="actions">
                      <button 
                        className="view-btn"
                        onClick={() => alert(`Full Response: ${prescription.response}`)}
                      >
                        View
                      </button>
                      {prescription.uploaded && (
                        <button 
                          className="download-btn"
                          onClick={() => downloadUploadedFile(prescription)}
                        >
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPrescriptions.length === 0 && (
              <div className="no-results">
                {searchQuery ? 'No prescriptions found matching your search.' : 'No prescriptions data available.'}
              </div>
            )}
          </div>
        </div>
        {/* RIGHT COLUMN - Charts */}
        <div className="charts-section">
          <PrescriptionCharts prescriptions={prescriptions} />
        </div>
      </div>  
    </div>
  );
}

export default Prescriptions;


// kill -9 $(lsof -t -i:5555)
