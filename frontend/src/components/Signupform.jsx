import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../App.css";

function SignupForm({ setUser, onClose }) {
  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "participant",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email format").nullable(),
    phone: Yup.string().required("Phone number is required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
    confirm: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"),
    role: Yup.string().oneOf(["participant", "admin"], "Invalid role"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await axios.post("http://localhost:5000/api/signup", values);
      setUser(res.data.user);
      alert("Signup successful!");
      onClose();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
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
        <h2>Signup</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="first_name" placeholder="First Name" />
              <ErrorMessage name="first_name" component="div" className="error" />

              <Field name="last_name" placeholder="Last Name" />
              <ErrorMessage name="last_name" component="div" className="error" />

              <Field name="email" placeholder="Email (optional)" />
              <ErrorMessage name="email" component="div" className="error" />

              <Field name="phone" placeholder="Phone" />
              <ErrorMessage name="phone" component="div" className="error" />

              <Field type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" className="error" />

              <Field type="password" name="confirm" placeholder="Confirm Password" />
              <ErrorMessage name="confirm" component="div" className="error" />

              <Field as="select" name="role">
                <option value="participant">Participant</option>
                <option value="admin">Admin</option>
              </Field>
              <ErrorMessage name="role" component="div" className="error" />

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default SignupForm;
