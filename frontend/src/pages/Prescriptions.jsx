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
  

  



  return (
    <div>
      <h1>Prescriptions</h1>
      <p>View and manage prescriptions.</p>
    </div>
  );
}

export default Prescriptions;
