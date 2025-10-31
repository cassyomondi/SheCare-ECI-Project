// frontend-auth/src/components/LoginForm.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../App.css";

function LoginForm({ setUser, onClose }) {
  const initialValues = { emailOrPhone: "", password: "" };

  const validationSchema = Yup.object({
    emailOrPhone: Yup.string().required("Email or phone is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    const payload = {
      email: values.emailOrPhone.includes("@") ? values.emailOrPhone : null,
      phone: values.emailOrPhone.includes("@") ? null : values.emailOrPhone,
      password: values.password,
    };

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, payload);

    const loggedInUser = res.data.user;
    setUser(loggedInUser);

    if (loggedInUser.role === "admin") {
      // redirect to admin panel (different frontend)
      window.location.href = "http://127.0.0.1:5174"; // frontend-admin-panel URL
    } else {
      // redirect to user dashboard
      window.location.href = "/user-dashboard";
    }

    resetForm();
  } catch (err) {
    alert(err.response?.data?.error || "Login failed");
  } finally {
    setSubmitting(false);
  }
};



  return (
  <div className="overlay">
    <div className="login-container">
      <button type="button" className="close-btn" onClick={onClose}>
        ✕
      </button>
      <h2 className="login-title">Login</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <Field
              name="emailOrPhone"
              placeholder="Email or Phone"
              className="login-input"
            />
            <ErrorMessage
              name="emailOrPhone"
              component="div"
              className="error"
            />

            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="login-input"
            />
            <ErrorMessage name="password" component="div" className="error" />

            <button type="submit" disabled={isSubmitting} className="gradient-btn">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  </div>
);

}

export default LoginForm;
