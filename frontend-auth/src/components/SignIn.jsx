import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function SignIn({ onSwitch }) {
  const [apiError, setApiError] = useState(""); // <-- state for API error

  const initialValues = {
    phone: "",
    password: "",
  };

  // Updated validation: phone must start with optional +, followed by digits only
  const validationSchema = Yup.object({
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\+?\d+$/, "Phone number can only contain digits and +"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError(""); // clear previous error
    try {
      const payload = {
        phone: values.phone,
        password: values.password,
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, payload);
      const loggedInUser = res.data.user;

      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
      }

      resetForm();

      if (loggedInUser.role === "admin") {
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

  // Optional: prevent invalid characters while typing
  const handlePhoneChange = (e, setFieldValue) => {
    const value = e.target.value;
    const sanitized = value.replace(/[^0-9+]/g, ""); // remove invalid characters
    setFieldValue("phone", sanitized);
  };

  return (
    <>
      <h2 className="auth-title">
        Sign In to talk to SheCare on WhatsApp
      </h2>

      {apiError && <div className="auth-error-banner">{apiError}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form className="auth-form">
            <Field
              type="tel"
              name="phone"
              placeholder="Phone number"
              className="auth-input"
              onChange={(e) => handlePhoneChange(e, setFieldValue)}
            />
            <ErrorMessage name="phone" component="div" className="auth-error" />

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
            />
            <ErrorMessage name="password" component="div" className="auth-error" />

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
