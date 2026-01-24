// src/pages/ResetPassword.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topRef = useRef(null);

  const urlToken = searchParams.get("token") || "";
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  useEffect(() => {
    if (apiError || apiSuccess) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [apiError, apiSuccess]);

  const initialValues = useMemo(
    () => ({
      token: urlToken,
      password: "",
      confirmPassword: "",
    }),
    [urlToken]
  );

  const validationSchema = Yup.object({
    // Only require token if it's not present in the URL
    token: Yup.string().when([], {
      is: () => !urlToken,
      then: (schema) => schema.required("Reset token is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: Yup.string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your new password")
      .oneOf([Yup.ref("password")], "Passwords do not match"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setApiError("");
    setApiSuccess("");

    try {
      const tokenToUse = urlToken || values.token;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/reset-password`,
        {
          token: tokenToUse,
          password: values.password,
        }
      );

      setApiSuccess(res.data?.message || "Password updated successfully.");
      resetForm();

      // Redirect back to sign-in shortly after success
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setApiError(err.response?.data?.error || "Password reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Keep the left panel for desktop consistency; mobile hides it via CSS */}
      <div className="auth-left" />

      <div className="auth-right auth-right-centered">
        <div className="auth-content-container fade">
          <div ref={topRef} />

          <h2 className="auth-title">Reset your password</h2>

          {apiError && <div className="auth-error-banner">{apiError}</div>}
          {apiSuccess && <div className="auth-success-banner">{apiSuccess}</div>}

          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, submitCount }) => (
              <Form className="auth-form">
                {/* If token is NOT in the URL, allow manual entry */}
                {!urlToken && (
                  <>
                    <Field
                      type="text"
                      name="token"
                      placeholder="Reset token"
                      className="auth-input"
                      autoComplete="one-time-code"
                    />
                    {submitCount > 0 && (
                      <ErrorMessage
                        name="token"
                        component="div"
                        className="auth-error"
                      />
                    )}
                  </>
                )}

                <Field
                  type="password"
                  name="password"
                  placeholder="New password"
                  className="auth-input"
                  autoComplete="new-password"
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
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="auth-input"
                  autoComplete="new-password"
                />
                {submitCount > 0 && (
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="auth-error"
                  />
                )}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update password"}
                </button>

                <p className="auth-footer">
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
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
