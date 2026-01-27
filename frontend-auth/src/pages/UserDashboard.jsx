// UserDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";

// Same list (alphabetical by name)
const COUNTRY_OPTIONS = [
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", minLocalDigits: 9 },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦", minLocalDigits: 10 },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪", minLocalDigits: 10 },
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "🇪🇹", minLocalDigits: 9 },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷", minLocalDigits: 9 },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", minLocalDigits: 9 },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳", minLocalDigits: 10 },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪", minLocalDigits: 9 },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬", minLocalDigits: 10 },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "🇷🇼", minLocalDigits: 9 },
  { code: "SA", name: "South Africa", dial: "+27", flag: "🇿🇦", minLocalDigits: 9 },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿", minLocalDigits: 9 },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬", minLocalDigits: 9 },
  { code: "UK", name: "United Kingdom", dial: "+44", flag: "🇬🇧", minLocalDigits: 10 },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸", minLocalDigits: 10 },
];

const getCountryByCode = (code) =>
  COUNTRY_OPTIONS.find((c) => c.code === code) || COUNTRY_OPTIONS.find((c) => c.code === "KE") || COUNTRY_OPTIONS[0];

const parseE164Phone = (rawPhone) => {
  const p = (rawPhone || "").replace(/\s+/g, "");
  // match the longest dial prefix first
  const sorted = [...COUNTRY_OPTIONS].sort((a, b) => b.dial.length - a.dial.length);

  for (const c of sorted) {
    if (p.startsWith(c.dial)) {
      return { country: c.code, local: p.slice(c.dial.length).replace(/\D/g, "") };
    }
  }

  // fallback: assume Kenya if unknown format
  return { country: "KE", local: p.replace(/^\+/, "").replace(/\D/g, "") };
};

function FlagSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.code === value) || options[0];

  useEffect(() => {
    const onDocClick = (e) => {
      if (btnRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div className="flag-dd">
      <button
        type="button"
        className="flag-dd-btn"
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title={`${selected.name} ${selected.dial}`}
      >
        <span className="flag-dd-flag">{selected.flag}</span>
        <span className="flag-dd-chevron">▾</span>
      </button>

      {open && (
        <div className="flag-dd-menu" role="listbox" ref={listRef} tabIndex={-1}>
          {options.map((opt) => (
            <button
              type="button"
              key={opt.code}
              role="option"
              aria-selected={opt.code === value}
              className={`flag-dd-option ${opt.code === value ? "is-selected" : ""}`}
              onClick={() => handleSelect(opt.code)}
            >
              <span className="flag-dd-option-flag">{opt.flag}</span>
              <span className="flag-dd-option-name">{opt.name}</span>
              <span className="flag-dd-option-dial">{opt.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function UserDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard"); // "dashboard" | "profile"
  const [fading, setFading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mobile drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const firstName = user?.first_name?.trim() || "User";

  const clean = (v) => (typeof v === "string" ? v.trim() : "");
  const cleanPhone = (v) => (typeof v === "string" ? v.replace(/\s+/g, "") : "");


  // -------------------------
  // PROFILE FORM STATE
  // -------------------------
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "KE",     
    phone_local: "",   
    current_password: "",
    password: "",
    confirm_password: "",
  });


  const [initialProfile, setInitialProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Hydrate profile form from user
  useEffect(() => {
    if (!user) return;

    const parsed = parseE164Phone(user.phone || "");

    const hydrated = {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      country: parsed.country || "KE",
      phone_local: parsed.local || "",
      current_password: "",
      password: "",
      confirm_password: "",
    };

    setProfile(hydrated);
    setInitialProfile(hydrated);
  }, [user]);


  const isDirty = useMemo(() => {
    if (!initialProfile) return false;

    const phoneNow = `${getCountryByCode(profile.country).dial}${cleanPhone(profile.phone_local)}`;
    const phoneInitial = `${getCountryByCode(initialProfile.country).dial}${cleanPhone(initialProfile.phone_local)}`;

    const changedBasics =
      clean(profile.first_name) !== clean(initialProfile.first_name) ||
      clean(profile.last_name) !== clean(initialProfile.last_name) ||
      clean(profile.email).toLowerCase() !== clean(initialProfile.email).toLowerCase() ||
      phoneNow !== phoneInitial;


    const changingPassword = clean(profile.password).length > 0;

    return changedBasics || changingPassword;
  }, [profile, initialProfile]);


  const passwordNeedsConfirm = clean(profile.password).length > 0;


  const canSave = useMemo(() => {
    if (!isDirty || saving) return false;

    const newPass = clean(profile.password);
    const currentPass = clean(profile.current_password);
    const confirmPass = clean(profile.confirm_password);

    // If password is being changed, current password required + confirm must match
    if (newPass.length > 0) {
      if (!currentPass) return false;
      if (newPass.length < 8) return false;
      if (confirmPass !== newPass) return false;
    }

    if (!clean(profile.first_name)) return false;
    if (!clean(profile.last_name)) return false;
    if (!clean(profile.email)) return false;

    const c = getCountryByCode(profile.country);
    const localDigits = cleanPhone(profile.phone_local).replace(/[^\d]/g, "");

    if (!localDigits) return false;
    if (localDigits.length < (c.minLocalDigits ?? 8)) return false;


    return true;
  }, [isDirty, saving, profile]);


  const onProfileChange = (field) => (e) => {
    setProfileError("");
    setProfileSuccess("");
    const value = e.target.value;

    if (field === "phone_local") {
      const sanitized = value.replace(/[^\d]/g, "");
      setProfile((p) => ({ ...p, phone_local: sanitized }));
      return;
    }

    setProfile((p) => ({ ...p, [field]: value }));
  };
  

  const onCountryChange = (code) => {
    setProfileError("");
    setProfileSuccess("");
    setProfile((p) => ({ ...p, country: code }));
  };


  const saveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileError("Session expired. Please sign in again.");
        setSaving(false);
        return;
      }

      const first_name = clean(profile.first_name);
      const last_name = clean(profile.last_name);
      const email = clean(profile.email).toLowerCase();
      const phone = cleanPhone(profile.phone);

      const new_password = clean(profile.password);
      const current_password = clean(profile.current_password);

      // Only send non-empty fields (prevents blanks reaching backend)
      const payload = {};
      if (first_name) payload.first_name = first_name;
      if (last_name) payload.last_name = last_name;
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      // If password is being changed, send current + new password (trimmed)
      if (new_password) {
        payload.current_password = current_password; // canSave guarantees it's present
        payload.new_password = new_password;
      }

      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);

      const reset = {
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        current_password: "",
        password: "",
        confirm_password: "",
      };

      setProfile(reset);
      setInitialProfile(reset);
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };


  // -------------------------
  // NAV / LAYOUT
  // -------------------------
  const switchTab = (tab) => {
    if (tab === active) return;
    setFading(true);
    window.setTimeout(() => {
      setActive(tab);
      setFading(false);
      setMobileNavOpen(false);
    }, 120);
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

  const cancelSignOut = () => setShowLogoutConfirm(false);

  const toggleMobileNav = () => setMobileNavOpen((v) => !v);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className={`sd-shell ${mobileNavOpen ? "sd-noScroll" : ""}`}>
      {/* TOP BAR (Mobile) */}
      <header className="sd-topbar" role="banner">
        <button
          type="button"
          className="sd-hamburger"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileNavOpen}
          onClick={toggleMobileNav}
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
                <h1 className="sd-title">Hello, {firstName}</h1>
                <p className="sd-subtitle">We&apos;re glad to have you here.</p>
              </header>

              {/* FEATURES */}
              <div className="sd-features">
                <div className="sd-featureCard sd-feature1">
                  <img className="sd-featureImg" src="/images/features/symptoms.png" alt="" aria-hidden="true" />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Check Symptoms Privately</div>
                    <div className="sd-featureSub">
                      Use our confidential symptom checker to get personalized insights on your health.
                    </div>
                  </div>
                </div>

                <div className="sd-featureCard sd-feature2">
                  <img className="sd-featureImg" src="/images/features/clinics.png" alt="" aria-hidden="true" />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Find Verified Clinics Near You</div>
                    <div className="sd-featureSub">Locate trusted clinics in your area with ease.</div>
                  </div>
                </div>

                <div className="sd-featureCard sd-feature3">
                  <img className="sd-featureImg" src="/images/features/prescription.png" alt="" aria-hidden="true" />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Access Prescription Support</div>
                    <div className="sd-featureSub">
                      Get assistance with managing and understanding your prescriptions.
                    </div>
                  </div>
                </div>

                <div className="sd-featureCard sd-feature4">
                  <img className="sd-featureImg" src="/images/features/tips.png" alt="" aria-hidden="true" />
                  <div className="sd-featureText">
                    <div className="sd-featureTitle">Receive Daily Health Tips</div>
                    <div className="sd-featureSub">
                      Get daily tips on reproductive health, wellness, and self-care to help you stay informed and
                      empowered.
                    </div>
                  </div>
                </div>
              </div>

              {/* SETUP INSTRUCTIONS */}
              <div className="sd-setup" aria-label="Setup instructions">
                <div className="sd-setupTitle">Setup instructions</div>

                <div className="sd-steps">
                  <div className="sd-step">
                    <div className="sd-stepNum">1</div>
                    <div className="sd-stepText">Tap the <strong>Chat with SheCare on WhatsApp</strong> button below.</div>
                  </div>

                  <div className="sd-step">
                    <div className="sd-stepNum">2</div>
                    <div className="sd-stepText">When WhatsApp opens, send <strong>Hi</strong> to start the chatbot.</div>
                  </div>

                  <div className="sd-step">
                    <div className="sd-stepNum">3</div>
                    <div className="sd-stepText">SheCare will reply with a menu of options you can choose from.</div>
                  </div>

                  <div className="sd-step">
                    <div className="sd-stepNum">4</div>
                    <div className="sd-stepText">Reply with the <strong>number</strong> of the option you want (for example: <strong>1</strong>).</div>
                  </div>

                  <div className="sd-step">
                    <div className="sd-stepNum">5</div>
                    <div className="sd-stepText">Continue replying to get guidance, clinic suggestions, or daily tips.</div>
                  </div>
                </div>
              </div>


              {/* WHATSAPP CTA (Desktop / non-mobile) */}
              <div className="sd-center">
                <a className="sd-whatsappBtn" href="https://wa.me/+14155238886" target="_blank" rel="noopener noreferrer">
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
            <section className="sd-panel" aria-label="Profile">
              <header className="sd-header">
                <h1 className="sd-title">Your Profile</h1>
                <p className="sd-subtitle">Update your details below.</p>
              </header>

              {profileError && <div className="sd-banner sd-bannerError">{profileError}</div>}
              {profileSuccess && <div className="sd-banner sd-bannerSuccess">{profileSuccess}</div>}

              <div className="sd-profileForm">
                <div className="sd-profileRow2">
                  <div className="sd-field">
                    <label className="sd-label">First name</label>
                    <input
                      className="sd-input"
                      value={profile.first_name}
                      onChange={onProfileChange("first_name")}
                      placeholder="First name"
                    />
                  </div>

                  <div className="sd-field">
                    <label className="sd-label">Last name</label>
                    <input
                      className="sd-input"
                      value={profile.last_name}
                      onChange={onProfileChange("last_name")}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="sd-field">
                  <label className="sd-label">Email address</label>
                  <input
                    className="sd-input"
                    type="email"
                    value={profile.email}
                    onChange={onProfileChange("email")}
                    placeholder="Email"
                    autoComplete="email"
                  />
                </div>

                <div className="sd-field">
                  <label className="sd-label">Phone number</label>
                  <input
                    className="sd-input"
                    value={profile.phone}
                    onChange={onProfileChange("phone")}
                    placeholder="Phone"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <div className="sd-field">
                  <label className="sd-label">New password</label>
                  <input
                    className="sd-input"
                    type="password"
                    value={profile.password}
                    onChange={onProfileChange("password")}
                    placeholder="Enter a new password"
                    autoComplete="new-password"
                  />
                  <div className="sd-hint">Leave blank to keep your current password.</div>
                </div>

                {passwordNeedsConfirm && (
                  <>
                    <div className="sd-field">
                      <label className="sd-label">Current password</label>
                      <input
                        className="sd-input"
                        type="password"
                        value={profile.current_password}
                        onChange={onProfileChange("current_password")}
                        placeholder="Confirm your current password"
                        autoComplete="current-password"
                      />
                      {!clean(profile.current_password) && (
                        <div className="sd-inlineError">Enter your current password to change it.</div>
                      )}

                    </div>

                    <div className="sd-field">
                      <label className="sd-label">Confirm new password</label>
                      <input
                        className="sd-input"
                        type="password"
                        value={profile.confirm_password}
                        onChange={onProfileChange("confirm_password")}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      {clean(profile.password).length > 0 &&
                        clean(profile.confirm_password).length > 0 &&
                        clean(profile.confirm_password) !== clean(profile.password) && (
                          <div className="sd-inlineError">Passwords do not match.</div>
                        )}
                      {clean(profile.password).length > 0 && clean(profile.password).length < 8 && (
                        <div className="sd-inlineError">Password must be at least 8 characters.</div>
                      )}
                    </div>
                  </>
                )}

                <div className="sd-profileActions">
                  <button
                    type="button"
                    className={`sd-saveBtn ${canSave ? "is-active" : ""}`}
                    disabled={!canSave}
                    onClick={saveProfile}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* FIXED MOBILE CTA (dashboard only) */}
      {active === "dashboard" && (
        <div className="sd-mobileCta" role="region" aria-label="Chat with SheCare">
          <a
            className="sd-whatsappBtn sd-whatsappBtnFixed"
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
      )}

      {showLogoutConfirm && (
        <div className="sd-modalOverlay">
          <div className="sd-modal">
            <h3 className="sd-modalTitle">Sign out?</h3>
            <p className="sd-modalText">Are you sure you want to sign out of your SheCare account?</p>

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
