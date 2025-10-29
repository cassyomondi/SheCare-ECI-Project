import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/Loginform";
import SignupForm from "./components/Signupform";
import About from "./components/About";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        {/* === NAVBAR === */}
        <nav className="navbar">
          <div className="logo">
            <img src="https://shecare-nu.vercel.app/images/logo.png" alt="SheCare Logo" />
            <span>SheCare</span>
          </div>

          <div className="nav-buttons">
            <button onClick={() => setShowLogin(true)}>Login</button>
            <button onClick={() => setShowSignup(true)}>Signup</button>
          </div>
        </nav>

        {/* === PAGE ROUTES === */}
        <main className="page-content">
          <Routes>
            <Route path="/" element={<About />} />
          </Routes>
        </main>

        {/* === MODALS === */}
        {showLogin && (
          <LoginForm setUser={setUser} onClose={() => setShowLogin(false)} />
        )}

        {showSignup && (
          <SignupForm setUser={setUser} onClose={() => setShowSignup(false)} />
        )}

        {/* === WHATSAPP ICON (visible only when logged in) === */}
        {user && (
          <a
            href="https://wa.me/254700000000"
            className="whatsapp-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/whatsapp-icon.png" alt="WhatsApp" />
          </a>
        )}
      </div>
    </Router>
  );
}

export default App;
