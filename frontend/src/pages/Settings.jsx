import React, {useState} from "react";


function Settings() {
  const [activeTab, setActiveTab]=useState("system")
  const [systemSettings, setSystemSettings] = useState({
    apiUrl: "http://127.0.0.1:5555",
    autoBackup: true,
    maintainanceMode: false,
    aiResponseDelay: "2"
  });
  const [userSettings, setUserSettings] = useState({
    allowNewUsers: true,
    defaultUserRole: "participant",
    sessionTimeout: "60",
    maxPrescriptionsPerUser: "10"
  });
  const handleSystemChange=(field, value) =>{
    setSystemSettings(prev =>({...prev, [field]: value}));
  };
  const handleUserChange = (field, value) =>{
    setUserSettings(prev =>({...prev, [field]: value}));
  };
  const saveSettings = ()=>{
    alert ("Admin settings saved successfully!")
  }

  const clearCache = () =>{
    if (window.confirm("Clear all system cache?")){
      alert("Cache cleared!");
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <p>Configure your application settings.</p>
    </div>
  );
}

export default Settings;
