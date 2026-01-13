import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

function SignUp({ onSwitch }) {
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
    first_name: Yup.string().required("Required"),
    last_name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string().required("Required"),
    password: Yup.string().min(6).required("Required"),
    confirm: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values };
      delete payload.confirm;

      await axios.post(`${import.meta.env.VITE_API_URL}/signup`, payload);

      alert("Signup successful");
      onSwitch(); // fade back to sign-in
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="auth-title">
        Sign Up to start talking to SheCare on WhatsApp
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="auth-form">
            <Field name="first_name" placeholder="First Name" className="auth-input" />
            <ErrorMessage name="first_name" component="div" />

            <Field name="last_name" placeholder="Last Name" className="auth-input" />
            <ErrorMessage name="last_name" component="div" />

            <Field name="email" placeholder="Email (optional)" className="auth-input" />

            <Field name="phone" placeholder="Phone number" className="auth-input" />

            <Field type="password" name="password" placeholder="Password" className="auth-input" />
            <Field type="password" name="confirm" placeholder="Confirm Password" className="auth-input" />

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
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
