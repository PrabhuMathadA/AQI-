import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/MainPage.module.css";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* 🌤️ Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlass}>
          <h1 className={styles.title}>Breathe Smarter, Live Better 🌍</h1>
          <p className={styles.subtitle}>
            Discover real-time air quality insights — modern, minimal, and built for awareness.
          </p>
        </div>
      </section>

      {/* 🌱 About Section */}
      <section className={styles.about}>
        <h2>About the Project</h2>
        <p>
          The <strong>Air Quality Dashboard</strong> combines modern design with accurate
          data. Built with <b>React</b> and <b>FastAPI</b>, it tracks live AQI readings
          and presents them through a smooth, user-friendly interface.
        </p>
        <p>
          Our goal is simple — to make environmental data beautiful, accessible,
          and actionable for everyone.
        </p>
      </section>

      {/* 💨 Features Section */}
      <section className={styles.features}>
        <h2>Key Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.icon}>🌎</span>
            <h3>Live AQI Data</h3>
            <p>Get up-to-date air quality readings from trusted global APIs.</p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.icon}>📊</span>
            <h3>Interactive Visuals</h3>
            <p>Experience data through clean, dynamic, and colorful charts.</p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.icon}>🩺</span>
            <h3>Health Insights</h3>
            <p>Receive smart health recommendations based on air conditions.</p>
          </div>

          <div className={styles.featureCard}>
            <span className={styles.icon}>⚡</span>
            <h3>Fast & Responsive</h3>
            <p>Enjoy seamless performance across all devices and screen sizes.</p>
          </div>
        </div>
      </section>

      {/* 🔹 Action Section */}
      <section className={styles.action}>
        <h2>Get Started</h2>
        <p>Join us to explore and understand your city’s air quality today.</p>
        <div className={styles.buttonGroup}>
          <button className={styles.loginBtn} onClick={() => navigate("/login")}>
            Login
          </button>
          <button className={styles.registerBtn} onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </section>

      {/* 🌇 Footer */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Air Quality Dashboard | Designed with 💙 for a Cleaner Planet
      </footer>
    </div>
  );
};

export default MainPage;
