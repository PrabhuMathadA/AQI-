import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Auth.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your registered email.");
      return;
    }
    alert(`Password reset link sent to ${email}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Enter your registered Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.btn}>
            Send Reset Link
          </button>
        </form>

        <p className={styles.registerText}>
          Remembered your password?{" "}
          <Link to="/" className={styles.registerLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
