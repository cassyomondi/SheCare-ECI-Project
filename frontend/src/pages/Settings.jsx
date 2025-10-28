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

  const exportData = ()=>{
    alert('Exporting all data...');
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
    <div classname="settigs-container">
      <div className="settings-header">
        <h1>Admin Settings</h1>
        <p>Manage SheCare System Configuration</p>
      </div>
      {/*Tab Navigation*/}
      <div className="settings-tab">
        <button 
        className={`tab-button ${activeTab ==='system' ? 'active' : ''}`}
        onClick={()=>setActiveTab('system')}
        >
          ⚙️ System
        </button>
        <button
        className={`tab-button ${activeTab === 'users'? 'active' : ''}`}
        onClick={()=> setActiveTab('users')}
        >
         👥 Users
        </button>
      </div>
      {/*System Configuration Tab*/}
      {activeTab === 'system' &&(
        <div className="settings-section">
          <h2>System Configuration</h2>
          <div className="setting-item">
            <label>API Base URL: </label>
            <input 
            type="text"
            value={systemSettings.apiUrl}
            onChange={(e)=> handleSystemChange('apiUrl', e.target.value)}
            className="setting-input"
            placeholder="http://127.0.0.1:5555"
            />
          </div>

          <div className="setting-item">
            <label>Ai Response Delay(seconds):  </label>
            <select
            value={systemSettings.aiResponseDelay}
            onChange={(e)=>handleSystemChange('aiResponseDelay', e.target.value)}
            className="setting-select"
            >
              <option value="1">1 second</option>
              <option value="2">2 seconds</option>
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
            </select>
          </div>
          <div className="setting-item">
            <label>
              <input 
              type= "checkout"
              checked={systemSettings.autoBackup}
              onChange={(e)=> handleSystemChange('autoBackup', e.target.value)}
              />
              :  Automatic Daily Backups: 

            </label>
          </div>
          <div className="settingn-item">
            <label>
              <input 
              type="checkout"
              checked={systemSettings.maintainanceMode}
              onChange={(e) => handleSystemChange('maintenanceMode', e.target.checked)}
              />
              :  Maintainance Mode (Pauses WhatsApp bot)
            </label>
          </div>
          <div className="setting-item">
            <h4>Systems Actions</h4>
            <button className="action-btn" onClick={exportData}>Export -All Data</button>
            <button className="action-btn" onClick={clearCache}>Clear Cache</button>
            <button className="action-btn danger">Restart WhatsApp Bot</button>
            
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="settings-section">
          <h2>User Management</h2>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={userSettings.allowNewUsers}
                onChange={(e) => handleUserChange('allowNewUsers', e.target.checked)}
              />
              Allow New WhatsApp Users
            </label>
          </div>

          <div className="setting-item">
            <label>Default User Role: </label>
            <select 
              value={userSettings.defaultUserRole}
              onChange={(e) => handleUserChange('defaultUserRole', e.target.value)}
              className="setting-select"
            >
              <option value="participant">Participant</option>
              <option value="practitioner">Practitioner</option>
            </select>
          </div>
           <div className="setting-item">
            <label>Session Timeout (minutes): </label>
            <select 
              value={userSettings.sessionTimeout}
              onChange={(e) => handleUserChange('sessionTimeout', e.target.value)}
              className="setting-select"
            >
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Max Prescriptions Per User: </label>
            <select 
              value={userSettings.maxPrescriptionsPerUser}
              onChange={(e) => handleUserChange('maxPrescriptionsPerUser', e.target.value)}
              className="setting-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50 (unlimited)</option>
            </select>
          </div>
        </div>
      )}
      {/* Save Button */}
      <div className="settings-actions">
        <button onClick={saveSettings} className="save-btn">Save Settings</button>
      </div>

    </div>
  );
}

export default Settings;
