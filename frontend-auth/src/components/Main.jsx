// src/components/Main.jsx
import React, { useState } from "react";
import "../App.css";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import AuthShell from "./AuthShell";

function Main({ setUser }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"

  return (
    <AuthShell contentKey={mode}>
      {mode === "signin" ? (
        <SignIn setUser={setUser} onSwitch={() => setMode("signup")} />
      ) : (
        <SignUp setUser={setUser} onSwitch={() => setMode("signin")} />
      )}
    </AuthShell>
  );
}

export default Main;
