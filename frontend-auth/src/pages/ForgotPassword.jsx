// src/pages/ForgotPassword.jsx
import { useState, useRef, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

function ForgotPassword() {
  const navigate = useNavigate();
  const topRef = useRef(null);

  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  useEffect(() => {
    if (apiError || apiSuccess) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [apiError, apiSuccess]);

  const initialValues = { emailOrPhone: "" };

  const validationSchema = Yup.object({
    emailOrPhone: Yup.string()
      .required("Email or phone is required")
      .test("email-or-phone", "Enter a valid email or phone number", (value) => {
        if (!value) return false;
        const v = value.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        const isPhone = /^\+?\d{10,15}$/.test(v.replace(/\s+/g, ""));
        return isEmail || isPhone;
      }),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");
    setApiSuccess("");

    try {
      const input = values.emailOrPhone.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

      const payload = {
        email: isEmail ? input.toLowerCase() : null,
        phone: isEmail ? null : input.replace(/\s+/g, ""),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/forgot-password`,
        payload
      );

      setApiSuccess(
        res.data?.message ||
          "If an account exists for that email/phone, reset instructions have been sent."
      );

      resetForm();
    } catch (err) {
      // Keep anti-enumeration behavior
      setApiSuccess(
        "If an account exists for that email/phone, reset instructions have been sent."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell contentKey="forgot-password">
      <div ref={topRef} />

      <h2 className="auth-title">Forgot your password?</h2>

      <p
        className="centered-text"
        style={{ marginTop: "-10px", marginBottom: 18, color: "#555" }}
      >
        Enter your email or phone number and we’ll help you reset your password.
      </p>

      {apiError && <div className="auth-error-banner">{apiError}</div>}
      {apiSuccess && <div className="auth-success-banner">{apiSuccess}</div>}

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

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset instructions"}
            </button>

            <p className="auth-footer">
              Remembered your password?{" "}
              <button
                type="button"
                className="auth-link link-btn"
                onClick={() => navigate("/")}
              >
                Back to Sign In
              </button>
            </p>
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
}

export default ForgotPassword;
