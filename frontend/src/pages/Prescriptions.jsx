import React from "react";
import axios from "axios";




function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    const totalPrescriptions = prescriptions.length;
    const totalInputTokens = prescriptions.reduce((sum, p) => sum + (parseInt(p.input_token) || 0), 0);
    const totalOutputTokens = prescriptions.reduce((sum, p) => sum + (parseInt(p.output_token) || 0), 0);
    const prescriptionsWithUpload = prescriptions.filter(p => p.uploaded).length;
    
    
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
    if (!query.trim()) {
      setFilteredPrescriptions(prescriptions);
      return;
    }
    
    const filtered = prescriptions.filter(prescription =>
      prescription.response?.toLowerCase().includes(query.toLowerCase()) ||
      prescription.user_id?.toString().includes(query)
    );
    setFilteredPrescriptions(filtered);
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
    <div className="prescritions-container">
      {/*Header section */}
      <div className="prescriptions-header">
        <h1>Prescriptions</h1>
        <p>View and manage prescriptions.</p>
      </div>
      {/*Search and filter section*/}
      <PrescriptionFilters onSearch={handleSearch} />

      
    </div>
  );
}

export default Prescriptions;


// kill -9 $(lsof -t -i:5555)
