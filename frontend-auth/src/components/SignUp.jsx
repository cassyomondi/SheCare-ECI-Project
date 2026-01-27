// src/components/SignUp.jsx
import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const COUNTRY_OPTIONS = [
  { code: "KE", label: "Kenya", dial: "+254", minLocalDigits: 9 }, // 7XXXXXXXX
  { code: "UG", label: "Uganda", dial: "+256", minLocalDigits: 9 },
  { code: "TZ", label: "Tanzania", dial: "+255", minLocalDigits: 9 },
  { code: "RW", label: "Rwanda", dial: "+250", minLocalDigits: 9 },
  { code: "BI", label: "Burundi", dial: "+257", minLocalDigits: 8 },
  { code: "ET", label: "Ethiopia", dial: "+251", minLocalDigits: 9 },
  { code: "SS", label: "South Sudan", dial: "+211", minLocalDigits: 9 },
  { code: "SO", label: "Somalia", dial: "+252", minLocalDigits: 8 },
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
    country: "KE",
    phone_local: "",
    password: "",
    confirm: "",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("Required"),
    last_name: Yup.string().required("Required"),
    email: Yup.string()
      .trim()
      .email("Enter a valid email")
      .required("Email is required"),
    country: Yup.string().required("Required"),
    phone_local: Yup.string()
      .required("Phone number is required")
      .matches(/^\d+$/, "Phone number can only contain digits")
      .test("min-digits", "Phone number is too short", function (value) {
        const { country } = this.parent;
        const countryObj = COUNTRY_OPTIONS.find((c) => c.code === country);
        const minDigits = countryObj?.minLocalDigits ?? 8;
        return (value || "").length >= minDigits;
      }),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Required"),
    confirm: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");

    try {
      const countryObj = COUNTRY_OPTIONS.find((c) => c.code === values.country);
      const dial = countryObj?.dial || "+254";

      // digits only for local part
      const localDigits = (values.phone_local || "").replace(/\D/g, "");

      // Build E.164: +2547XXXXXXXX (no spaces)
      const fullPhone = `${dial}${localDigits}`;

      const payload = {
        first_name: values.first_name?.trim(),
        last_name: values.last_name?.trim(),
        email: values.email?.trim().toLowerCase(),
        phone: fullPhone,
        password: values.password,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        payload
      );

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
    // digits only
    const sanitized = e.target.value.replace(/[^\d]/g, "");
    setFieldValue("phone_local", sanitized);
  };

  return (
    <>
      <div ref={topRef} />
      <h2 className="auth-title">Sign Up to talk to SheCare on WhatsApp</h2>

      {apiError && <div className="auth-error-banner">{apiError}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, submitCount, values }) => {
          const countryObj = COUNTRY_OPTIONS.find((c) => c.code === values.country);
          const dial = countryObj?.dial || "+254";

          return (
            <Form className="auth-form">
              <Field
                name="first_name"
                placeholder="First Name"
                className="auth-input"
                autoComplete="given-name"
              />
              {submitCount > 0 && (
                <ErrorMessage name="first_name" component="div" className="auth-error" />
              )}

              <Field
                name="last_name"
                placeholder="Last Name"
                className="auth-input"
                autoComplete="family-name"
              />
              {submitCount > 0 && (
                <ErrorMessage name="last_name" component="div" className="auth-error" />
              )}

              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="auth-input"
                autoComplete="email"
              />
              {submitCount > 0 && (
                <ErrorMessage name="email" component="div" className="auth-error" />
              )}

              {/* Phone: country code picker + local digits */}
              <div className="phone-row">
                <div className="phone-country">
                  <Field
                    as="select"
                    name="country"
                    className="auth-input"
                    onChange={(e) => setFieldValue("country", e.target.value)}
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label} ({c.dial})
                      </option>
                    ))}
                  </Field>
                </div>

                <div className="phone-local">
                  <div className="phone-prefix">{dial}</div>
                  <Field
                    name="phone_local"
                    placeholder="Phone number"
                    className="auth-input phone-input"
                    inputMode="tel"
                    autoComplete="tel"
                    onChange={(e) => handleLocalPhoneChange(e, setFieldValue)}
                  />
                </div>
              </div>

              {submitCount > 0 && (
                <ErrorMessage name="phone_local" component="div" className="auth-error" />
              )}

              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="auth-input"
                autoComplete="new-password"
              />
              {submitCount > 0 && (
                <ErrorMessage name="password" component="div" className="auth-error" />
              )}

              <Field
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                className="auth-input"
                autoComplete="new-password"
              />
              {submitCount > 0 && (
                <ErrorMessage name="confirm" component="div" className="auth-error" />
              )}

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
