import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function SignIn({ onSwitch }) {
  const [apiError, setApiError] = useState("");

  const initialValues = {
    phone: "",
    password: "",
  };

  const validationSchema = Yup.object({
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\+?\d+$/, "Phone number can only contain digits and +"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        values
      );

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

  const handlePhoneChange = (e, setFieldValue) => {
    const sanitized = e.target.value.replace(/[^0-9+]/g, "");
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
        {({ isSubmitting, setFieldValue, submitCount }) => (
          <Form className="auth-form">
            <Field
              type="tel"
              name="phone"
              placeholder="Phone number"
              className="auth-input"
              onChange={(e) => handlePhoneChange(e, setFieldValue)}
            />
            {submitCount > 0 && (
              <ErrorMessage name="phone" component="div" className="auth-error" />
            )}

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="password"
                component="div"
                className="auth-error"
              />
            )}

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
