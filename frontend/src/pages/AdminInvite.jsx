import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminInvite.css'; // Optional CSS

function AdminInvite() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const sendInvitation = async () => {
    if (!inviteEmail) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.post('http://127.0.0.1:5555/admin/invite', {
        email: inviteEmail,
        role: 'admin'
      });
      setMessage(`✅ Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
    } catch (error) {
      setMessage('❌ Error sending invitation: ' + (error.response?.data?.error || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-invite-page">
      <h1>Invite New Admins</h1>
      
      <div className="invite-form">
        <input 
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter email to invite as admin"
          disabled={loading}
        />
        <button 
          onClick={sendInvitation}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Admin Invitation'}
        </button>
      </div>

      {message && <div className="message">{message}</div>}
      
      <div className="invite-guide">
        <h3>How Admin Invitations Work:</h3>
        <div className="step">
          <span>1.</span>
          <p>You enter the email and send invitation</p>
        </div>
        <div className="step">
          <span>2.</span>
          <p>Recipient receives email with registration link</p>
        </div>
        <div className="step">
          <span>3.</span>
          <p>They complete registration and become admin</p>
        </div>
        <div className="step">
          <span>4.</span>
          <p>They can then login and access the admin dashboard</p>
        </div>
      </div>
    </div>
  );
}

export default AdminInvite;