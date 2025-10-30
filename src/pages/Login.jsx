import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Auth.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const validEmail = "admin@example.com";
    const validPassword = "12345";

    if (email === validEmail && password === validPassword) {
      alert("✅ Login Successful!");
      navigate("/dashboard");
    } else {
      alert("❌ Invalid credentials. Please try again!");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Air Quality Login</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </span>
            </div>
          </div>

          {/* Forgot password link */}
          <div className={styles.forgotContainer}>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className={styles.btn}>
            Login
          </button>
        </form>

        <p className={styles.registerText}>
          Don’t have an account?{" "}
          <Link to="/register" className={styles.registerLink}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
