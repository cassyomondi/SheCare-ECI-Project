// UserDashboard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function UserDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard"); // "dashboard" | "profile"
  const [fading, setFading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mobile drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      setMobileNavOpen(false); // close drawer on selection (mobile)
    }, 120); // quick fade
  };

  const handleSignOut = () => {
    setMobileNavOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowLogoutConfirm(false);
    navigate("/", { replace: true });
  };

  const cancelSignOut = () => {
    setShowLogoutConfirm(false);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="sd-shell">
      {/* TOP BAR (Mobile) */}
      <header className="sd-topbar" role="banner">
        <button
          type="button"
          className="sd-hamburger"
          aria-label="Open navigation menu"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 6.5h16a1 1 0 1 0 0-2H4a1 1 0 1 0 0 2Zm16 4.5H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2Zm0 6H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="sd-topbarBrand" aria-label="SheCare">
          <img
            src="https://shecare-nu.vercel.app/images/logo.png"
            alt="SheCare"
            className="sd-topbarLogo"
          />
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <button
        type="button"
        className={`sd-mobileOverlay ${mobileNavOpen ? "is-open" : ""}`}
        aria-label="Close navigation menu"
        onClick={closeMobileNav}
      />

      {/* LEFT SIDEBAR (Desktop) + DRAWER (Mobile) */}
      <aside className={`sd-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        {/* Drawer header (mobile only) */}
        <div className="sd-drawerHeader">
          <img
            src="https://shecare-nu.vercel.app/images/logo.png"
            alt="SheCare"
            className="sd-drawerLogo"
          />

          <button
            type="button"
            className="sd-drawerClose"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Desktop brand (desktop only) */}
        <div className="sd-brand">
          <img
            src="https://shecare-nu.vercel.app/images/logo.png"
            alt="SheCare"
            className="sd-logo"
          />
        </div>

        <div className="sd-navSpacer" />

        <nav className="sd-nav" aria-label="Dashboard navigation">
          <button
            className={`sd-navItem ${active === "dashboard" ? "is-active" : ""}`}
            onClick={() => switchTab("dashboard")}
            type="button"
          >
            <span className="sd-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sd-navLabel">Dashboard</span>
          </button>

          <button
            className={`sd-navItem ${active === "profile" ? "is-active" : ""}`}
            onClick={() => switchTab("profile")}
            type="button"
          >
            <span className="sd-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="sd-navLabel">Profile</span>
          </button>
        </nav>

        <div className="sd-spacer" />

        <button className="sd-signout" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </aside>

      {/* DIVIDER (Desktop) */}
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

              {/* FEATURES */}
              <div className="sd-features">
                <div className="sd-featureCard sd-feature1">
                  <img
                    className="sd-featureImg"
                    src="/images/features/symptoms.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Check Symptoms Privately</div>
                    <div className="sd-featureSub">
                      Use our confidential symptom checker to get personalized insights on your
                      health.
                    </div>
                  </div>
                </div>

                <div className="sd-featureCard sd-feature2">
                  <img
                    className="sd-featureImg"
                    src="/images/features/clinics.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Find Verified Clinics Near You</div>
                    <div className="sd-featureSub">Locate trusted clinics in your area with ease.</div>
                  </div>
                </div>

                <div className="sd-featureCard sd-feature3">
                  <img
                    className="sd-featureImg"
                    src="/images/features/prescription.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Access Prescription Support</div>
                    <div className="sd-featureSub">
                      Get assistance with managing and understanding your prescriptions.
                    </div>
                  </div>
                </div>

                <div className="sd-featureCard sd-feature4">
                  <img
                    className="sd-featureImg"
                    src="/images/features/tips.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Receive Daily Health Tips</div>
                    <div className="sd-featureSub">
                      Get daily tips on reproductive health, wellness, and self-care to help you stay
                      informed and empowered.
                    </div>
                  </div>
                </div>
              </div>

              {/* WHATSAPP CTA */}
              <div className="sd-center">
                <a
                  className="sd-whatsappBtn"
                  href="https://wa.me/+14155238886"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sd-waIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        fill="currentColor"
                        d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.51 0 .2 5.3.2 11.83c0 2.08.54 4.11 1.57 5.9L0 24l6.42-1.69a11.86 11.86 0 0 0 5.64 1.43h.01c6.55 0 11.86-5.3 11.86-11.83 0-3.16-1.23-6.14-3.41-8.43ZM12.06 21.7h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.81 1 1.02-3.71-.24-.38a9.86 9.86 0 0 1-1.52-5.18c0-5.45 4.46-9.89 9.96-9.89 2.66 0 5.16 1.03 7.04 2.9a9.82 9.82 0 0 1 2.92 6.99c0 5.45-4.46 9.89-9.95 9.89Zm5.77-7.41c-.31-.16-1.84-.9-2.12-1-.28-.1-.49-.16-.7.16-.2.31-.8 1-.98 1.2-.18.2-.36.23-.67.08-.31-.16-1.3-.48-2.47-1.52-.91-.8-1.52-1.79-1.7-2.1-.18-.31-.02-.48.14-.64.14-.14.31-.36.47-.54.16-.18.2-.31.31-.51.1-.2.05-.39-.03-.54-.08-.16-.7-1.67-.96-2.29-.25-.6-.51-.52-.7-.53l-.6-.01c-.2 0-.52.08-.8.39-.28.31-1.06 1.04-1.06 2.53s1.08 2.93 1.23 3.13c.16.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.37.2 1.89.12.58-.09 1.84-.75 2.1-1.47.26-.72.26-1.33.18-1.47-.08-.13-.28-.2-.6-.36Z"
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

      {showLogoutConfirm && (
        <div className="sd-modalOverlay">
          <div className="sd-modal">
            <h3 className="sd-modalTitle">Sign out?</h3>
            <p className="sd-modalText">
              Are you sure you want to sign out of your SheCare account?
            </p>

            <div className="sd-modalActions">
              <button type="button" className="sd-modalCancel" onClick={cancelSignOut}>
                Cancel
              </button>
              <button type="button" className="sd-modalConfirm" onClick={confirmSignOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
