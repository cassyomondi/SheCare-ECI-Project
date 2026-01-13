import { Link } from "react-router-dom";

function SignIn({ onSwitch }) {
  return (
    <>
      <h2 className="auth-title">
        Sign In to talk to SheCare on WhatsApp
      </h2>

      <form className="auth-form">
        <input type="tel" placeholder="Phone number" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />
        <button type="submit" className="auth-submit">
          Sign In
        </button>
      </form>

      <p className="auth-footer">
        No account yet?{" "}
        <button type="button" className="auth-link link-btn" onClick={onSwitch}>
          Sign Up
        </button>
      </p>
    </>
  );
}

export default SignIn;
