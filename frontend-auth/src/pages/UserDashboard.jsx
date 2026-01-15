import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";


function UserDashboard({ user }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard"); // "dashboard" | "profile"
  const [fading, setFading] = useState(false);

  // Prefer a real name if you later add it to /me; fallback to email prefix.
  const username = useMemo(() => {
    const maybeName =
      user?.first_name ||
      user?.name ||
      user?.full_name ||
      user?.username ||
      null;

    if (maybeName) return maybeName;

    const email = user?.email || "";
    if (email.includes("@")) return email.split("@")[0];

    return "User";
  }, [user]);

  

  const switchTab = (tab) => {
    if (tab === active) return;
    setFading(true);
    window.setTimeout(() => {
      setActive(tab);
      setFading(false);
    }, 120); // quick fade
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/"); // or "/signin" if you prefer
  };

  return (
    <div className="sd-shell">
      {/* LEFT SIDEBAR */}
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <img
            src="https://shecare-nu.vercel.app/images/logo.png"
            alt="SheCare"
            className="sd-logo"
          />
        </div>


        <nav className="sd-nav">
          <button
            className={`sd-navItem ${active === "dashboard" ? "is-active" : ""}`}
            onClick={() => switchTab("dashboard")}
            type="button"
          >
            <span className="sd-icon" aria-hidden="true">
              {/* house icon */}
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>Dashboard</span>
          </button>

          <button
            className={`sd-navItem ${active === "profile" ? "is-active" : ""}`}
            onClick={() => switchTab("profile")}
            type="button"
          >
            <span className="sd-icon" aria-hidden="true">
              {/* user icon */}
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>Profile</span>
          </button>
        </nav>

        <div className="sd-spacer" />

        <button className="sd-signout" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </aside>

      {/* DIVIDER */}
      <div className="sd-divider" />

      {/* MAIN CONTENT */}
      <main className="sd-main">
        <div className={`sd-content ${fading ? "is-fading" : ""}`}>
          {active === "dashboard" ? (
            <section className="sd-panel">
              <header className="sd-header">
                <h1 className="sd-title">Hello, {username}</h1>
                <p className="sd-subtitle">We&apos;re glad to have you here.</p>
              </header>

              <div className="sd-center">
                <a
                  className="sd-whatsappBtn"
                  href="https://wa.me/+14155238886"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sd-waIcon" aria-hidden="true">
                    {/* whatsapp icon */}
                    <svg viewBox="0 0 32 32" width="18" height="18">
                      <path
                        d="M19.1 17.6c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.8.9-1 1.1-.4.2-.7.1c-.3-.1-1.3-.5-2.5-1.6-.9-.8-1.6-1.9-1.7-2.2s0-.5.1-.6l.5-.6c.1-.2.2-.4.3-.6s0-.4 0-.6c-.1-.1-.7-1.6-1-2.2-.3-.6-.6-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1-1.1 2.5 1.1 2.9 1.2 3.1c.1.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z"
                        fill="currentColor"
                      />
                      <path
                        d="M26.7 5.3A13.7 13.7 0 0 0 4.5 21.9L3 29l7.3-1.9A13.7 13.7 0 0 0 29 16a13.6 13.6 0 0 0-2.3-10.7zM16 27a11 11 0 0 1-5.6-1.5l-.4-.2-4.3 1.1 1.1-4.2-.2-.4A11 11 0 1 1 16 27z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  Chat with SheCare on WhatsApp
                </a>
              </div>
            </section>
          ) : (
            <section className="sd-panel sd-panelBlank" aria-label="Profile">
              {/* Blank for now */}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
