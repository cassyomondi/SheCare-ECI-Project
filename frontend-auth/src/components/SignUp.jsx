// src/components/SignUp.jsx
import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Minimal list (add more as needed)
const COUNTRY_OPTIONS = [
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪", minLocalDigits: 9 },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬", minLocalDigits: 9 },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿", minLocalDigits: 9 },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "🇷🇼", minLocalDigits: 9 },
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "🇪🇹", minLocalDigits: 9 },
];

function SignUp({ onSwitch, setUser }) {
  const [apiError, setApiError] = useState("");
  const topRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (apiError) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [apiError]);

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    country: "KE",       // ✅ default Kenya
    phone_local: "",     // editable part ONLY
    password: "",
    confirm: "",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("Required"),
    last_name: Yup.string().required("Required"),
    email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
    country: Yup.string().required("Required"),
    phone_local: Yup.string()
      .required("Phone number is required")
      .matches(/^\d+$/, "Phone number can only contain digits")
      .test("min-digits", "Phone number is too short", function (value) {
        const { country } = this.parent;
        const c = COUNTRY_OPTIONS.find((x) => x.code === country);
        const minDigits = c?.minLocalDigits ?? 8;
        return (value || "").length >= minDigits;
      }),
    password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
    confirm: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");
    try {
      const c = COUNTRY_OPTIONS.find((x) => x.code === values.country) || COUNTRY_OPTIONS[0];
      const localDigits = (values.phone_local || "").replace(/\D/g, "");
      const fullPhone = `${c.dial}${localDigits}`; // ✅ full E.164 output

      const payload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: fullPhone,
        password: values.password,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, payload);

      const token = res.data?.access_token;
      if (!token) {
        setApiError("Sign Up succeeded but no token was returned.");
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
      setApiError(err.response?.data?.error || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocalPhoneChange = (e, setFieldValue) => {
    // digits only; prefix is separate so user cannot erase it
    const sanitized = e.target.value.replace(/[^\d]/g, "");
    setFieldValue("phone_local", sanitized);
  };

  return (
    <>
      <div ref={topRef} />
      <h2 className="auth-title">Sign Up to talk to SheCare on WhatsApp</h2>

      {apiError && <div className="auth-error-banner">{apiError}</div>}

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, setFieldValue, submitCount, values }) => {
          const c = COUNTRY_OPTIONS.find((x) => x.code === values.country) || COUNTRY_OPTIONS[0];

          return (
            <Form className="auth-form">
              <Field
                name="first_name"
                placeholder="First Name"
                className="auth-input"
                autoComplete="given-name"
              />
              {submitCount > 0 && <ErrorMessage name="first_name" component="div" className="auth-error" />}

              <Field
                name="last_name"
                placeholder="Last Name"
                className="auth-input"
                autoComplete="family-name"
              />
              {submitCount > 0 && <ErrorMessage name="last_name" component="div" className="auth-error" />}

              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="auth-input"
                autoComplete="email"
              />
              {submitCount > 0 && <ErrorMessage name="email" component="div" className="auth-error" />}

              {/* ✅ Minimalist phone row */}
              <div className="phone-min-row">
                {/* Flag dropdown (left) */}
                <div className="phone-flag-wrap">
                  <select
                    className="phone-flag-select"
                    value={values.country}
                    onChange={(e) => setFieldValue("country", e.target.value)}
                    aria-label="Select country"
                  >
                    {COUNTRY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.flag} {opt.name} {opt.dial}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fixed prefix + editable local digits */}
                <div className="phone-input-wrap">
                  <span className="phone-prefix-fixed">{c.dial}</span>

                  <Field
                    name="phone_local"
                    placeholder="Phone number"
                    className="auth-input phone-local-input"
                    inputMode="tel"
                    autoComplete="tel"
                    onChange={(e) => handleLocalPhoneChange(e, setFieldValue)}
                  />
                </div>
              </div>

              {submitCount > 0 && <ErrorMessage name="phone_local" component="div" className="auth-error" />}

              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="auth-input"
                autoComplete="new-password"
              />
              {submitCount > 0 && <ErrorMessage name="password" component="div" className="auth-error" />}

              <Field
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                className="auth-input"
                autoComplete="new-password"
              />
              {submitCount > 0 && <ErrorMessage name="confirm" component="div" className="auth-error" />}

              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Sign Up"}
              </button>
            </Form>
          );
        }}
      </Formik>

      <p className="auth-footer">
        Already have an account?{" "}
        <button type="button" className="auth-link link-btn" onClick={onSwitch}>
          Sign In
        </button>
      </p>
    </>
  );
}

export default SignUp;
