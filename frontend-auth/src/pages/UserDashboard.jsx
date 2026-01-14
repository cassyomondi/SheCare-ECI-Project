import "../App.css";

function UserDashboard({ user }) {
  return (
    <div className="dashboard-overlay">
      <div className="dashboard-card">
        <img
          src="https://shecare-nu.vercel.app/images/logo.png"
          alt="SheCare Logo"
          className="dashboard-logo"
        />

        <h1>Welcome {user.email}</h1>
        <p className="dashboard-subtext">We're glad to have you here.</p>

        <a
          href="https://wa.me/+14155238886"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          Chat with SheCare on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default UserDashboard;
