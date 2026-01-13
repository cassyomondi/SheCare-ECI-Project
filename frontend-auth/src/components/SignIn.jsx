import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function SignIn({ onSwitch }) {
  const initialValues = {
    phone: "",
    password: "",
  };

  const validationSchema = Yup.object({
    phone: Yup.string().required("Phone number is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        phone: values.phone,
        password: values.password,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        payload
      );

      const loggedInUser = res.data.user;

      // Optional: persist token if returned
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
      }

      resetForm();

      // Redirect based on role
      if (loggedInUser.role === "admin") {
        window.location.href = "http://127.0.0.1:5174";
      } else {
        window.location.href = "/user-dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="auth-title">
        Sign In to talk to SheCare on WhatsApp
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="auth-form">
            <Field
              type="tel"
              name="phone"
              placeholder="Phone number"
              className="auth-input"
            />
            <ErrorMessage
              name="phone"
              component="div"
              className="auth-error"
            />

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="auth-input"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="auth-error"
            />

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
        <button
          type="button"
          className="auth-link link-btn"
          onClick={onSwitch}
        >
          Sign Up
        </button>
      </p>
    </>
  );
}

export default SignIn;
