import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function SignUp({ onSwitch }) {
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const initialValues = {
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    confirm: "",
    role: "participant",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("Required"),
    last_name: Yup.string().required("Required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\+?\d+$/, "Phone number can only contain digits and +"),
    password: Yup.string().min(6).required("Required"),
    confirm: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");
    setApiSuccess("");
    try {
      const payload = { ...values };
      delete payload.confirm;

      await axios.post(`${import.meta.env.VITE_API_URL}/signup`, payload);

      setApiSuccess("Signup successful!");
      resetForm();

      setTimeout(onSwitch, 1000);
    } catch (err) {
      setApiError(err.response?.data?.error || "Signup failed");
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
        Sign Up to talk to SheCare on WhatsApp
      </h2>

      {apiError && <div className="auth-error-banner">{apiError}</div>}
      {apiSuccess && <div className="auth-success-banner">{apiSuccess}</div>}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, submitCount }) => (
          <Form className="auth-form">
            <Field
              name="first_name"
              placeholder="First Name"
              className="auth-input"
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="first_name"
                component="div"
                className="auth-error"
              />
            )}

            <Field
              name="last_name"
              placeholder="Last Name"
              className="auth-input"
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="last_name"
                component="div"
                className="auth-error"
              />
            )}

            <Field
              name="phone"
              placeholder="Phone number"
              className="auth-input"
              onChange={(e) => handlePhoneChange(e, setFieldValue)}
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="phone"
                component="div"
                className="auth-error"
              />
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

            <Field
              type="password"
              name="confirm"
              placeholder="Confirm Password"
              className="auth-input"
            />
            {submitCount > 0 && (
              <ErrorMessage
                name="confirm"
                component="div"
                className="auth-error"
              />
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Sign Up"}
            </button>
          </Form>
        )}
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
