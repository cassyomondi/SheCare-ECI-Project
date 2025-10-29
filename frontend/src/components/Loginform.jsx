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

      const res = await axios.post("http://localhost:5000/api/login", payload);
      setUser(res.data.user);
      alert("Login successful!");
      onClose();
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
        <h2>Login</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="emailOrPhone" placeholder="Email or Phone" />
              <ErrorMessage name="emailOrPhone" component="div" className="error" />

              <Field type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" className="error" />

              <button type="submit" disabled={isSubmitting}>
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
