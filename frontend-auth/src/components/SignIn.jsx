// src/components/SignIn.jsx
import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignIn({ onSwitch, setUser }) {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const topRef = useRef(null);

  useEffect(() => {
    if (apiError) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [apiError]);

  const initialValues = {
    emailOrPhone: "",
    password: "",
  };

  const validationSchema = Yup.object({
    emailOrPhone: Yup.string()
      .required("Email or phone is required")
      .test("email-or-phone", "Enter a valid email or phone number", (value) => {
        if (!value) return false;
        const v = value.trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?\d{10,15}$/.test(v);
      }),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");
    try {
      const input = values.emailOrPhone.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

      const payload = {
        email: isEmail ? input.toLowerCase() : null,
        phone: isEmail ? null : input.replace(/\s+/g, ""),
        password: values.password,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        payload
      );

      const token = res.data?.access_token;
      if (!token) {
        setApiError("Login succeeded but no token was returned.");
        return;
      }

      localStorage.setItem("token", token);

      const meRes = await axios.get(`${import.meta.env.VITE_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(meRes.data);

      resetForm();
      navigate("/user-dashboard");
    } catch (err) {
      setApiError(err.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div ref={topRef} />
      <h2 className="auth-title">Sign In to talk to SheCare on WhatsApp</h2>
      {apiError && <div className="auth-error-banner">{apiError}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, submitCount }) => (
          <Form className="auth-form">
            <Field
              type="text"
              name="emailOrPhone"
              placeholder="Email or phone number"
              className="auth-input"
              autoComplete="username"
              inputMode="email"
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="emailOrPhone"
                component="div"
                className="auth-error"
              />
            )}

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
              autoComplete="current-password"
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="password"
                component="div"
                className="auth-error"
              />
            )}

            <div className="auth-row">
              <button
                type="button"
                className="auth-link link-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </Form>
        )}
      </Formik>

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
