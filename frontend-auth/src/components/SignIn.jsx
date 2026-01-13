import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function SignIn({ onSwitch }) {
  const [apiError, setApiError] = useState("");

  const initialValues = {
    emailOrPhone: "",
    password: "",
  };

  const validationSchema = Yup.object({
    emailOrPhone: Yup.string()
      .required("Email or phone is required")
      .test("email-or-phone", "Enter a valid email or phone number", (value) => {
        if (!value) return false;

        const trimmed = value.trim();

        // email check (simple but effective)
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

        // phone check: optional + then digits only
        const isPhone = /^\+?\d+$/.test(trimmed);

        return isEmail || isPhone;
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
        phone: isEmail ? null : input,
        password: values.password,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, payload);

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
      }

      resetForm();

      if (res.data.user.role === "admin") {
        window.location.href = "http://127.0.0.1:5174";
      } else {
        window.location.href = "/user-dashboard";
      }
    } catch (err) {
      setApiError(err.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Optional: sanitize only if user is typing a phone (no @ present)
  const handleEmailOrPhoneChange = (e, setFieldValue) => {
    const raw = e.target.value;

    if (raw.includes("@")) {
      // treat as email: allow normal characters
      setFieldValue("emailOrPhone", raw);
      return;
    }

    // treat as phone: digits and + only
    const sanitized = raw.replace(/[^0-9+]/g, "");
    setFieldValue("emailOrPhone", sanitized);
  };

  return (
    <>
      <h2 className="auth-title">Sign In to talk to SheCare on WhatsApp</h2>

      {apiError && <div className="auth-error-banner">{apiError}</div>}

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, setFieldValue, submitCount }) => (
          <Form className="auth-form">
            <Field
              type="text"
              name="emailOrPhone"
              placeholder="Email or phone number"
              className="auth-input"
              onChange={(e) => handleEmailOrPhoneChange(e, setFieldValue)}
            />
            {submitCount > 0 && (
              <ErrorMessage name="emailOrPhone" component="div" className="auth-error" />
            )}

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
            />
            {submitCount > 0 && (
              <ErrorMessage name="password" component="div" className="auth-error" />
            )}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
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
