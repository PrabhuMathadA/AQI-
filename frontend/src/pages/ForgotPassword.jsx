import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Auth.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  alert(data.message || data.detail);
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
