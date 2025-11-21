import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";
import aqiImage from "../assets/bg.jpg";

const Dashboard = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!city.trim()) {
      alert("Please enter a city name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/aqi/?city=${encodeURIComponent(city)}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch AQI for ${city}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      navigate("/result", {
        state: {
          city: data.city,
          aqi: data.aqi,
          status: data.status,
          pollutants: data.pollutants,
        },
      });
    } catch (err) {
      console.error("API error:", err);
      alert("Could not fetch live AQI data. Please check your backend and the city name.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ULTRA PREMIUM LOADER ----------------
  if (loading) {
    return (
      <div className={styles.ultraLoaderWrap} role="status" aria-live="polite" aria-label="Fetching air quality data">
        <div className={styles.orbContainer}>
          {/* SVG Orb with animated gradient */}
          <svg className={styles.orb} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <radialGradient id="g1" cx="35%" cy="30%" r="85%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#bfe9ff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#4facfe" stopOpacity="0.15" />
              </radialGradient>

              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7afcff"/>
                <stop offset="50%" stopColor="#4facfe"/>
                <stop offset="100%" stopColor="#00f2fe"/>
              </linearGradient>

              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* soft globe */}
            <circle cx="100" cy="100" r="62" fill="url(#g1)" filter="url(#softGlow)"/>

            {/* rotating rings */}
            <g className={styles.rings}>
              <ellipse cx="100" cy="100" rx="78" ry="30" fill="none" stroke="url(#ringGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.95"/>
              <ellipse cx="100" cy="100" rx="30" ry="78" fill="none" stroke="url(#ringGrad)" strokeWidth="2.2" strokeLinecap="round" opacity="0.9"/>
            </g>

            {/* subtle sparkle */}
            <g className={styles.sparkles}>
              <circle cx="52" cy="56" r="1.8" fill="#fff"/>
              <circle cx="150" cy="44" r="1.2" fill="#fff"/>
              <circle cx="138" cy="150" r="1.6" fill="#fff"/>
            </g>
          </svg>

          {/* floating particles (DOM elements for performance & blur) */}
          <div className={styles.particles}>
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className={styles.particle} />
            ))}
          </div>

          {/* orbit rings (pure CSS for rotation) */}
          <div className={styles.orbitRings}>
            <div className={styles.ringA}></div>
            <div className={styles.ringB}></div>
            <div className={styles.centerGlow}></div>
          </div>
        </div>

        {/* status text */}
        <div className={styles.loaderTextWrap}>
          <h3 className={styles.loaderTitle}>Fetching live air quality</h3>
          <p className={styles.loaderSubtitle}>Gathering data from trusted sources…</p>
        </div>
      </div>
    );
  }

  // ---------------- NORMAL DASHBOARD ----------------
  return (
    <div className={styles.container}>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "#ff4d4f",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <div className={styles.wrapper}>
        <h1 className={styles.title}>Air Quality Index Dashboard</h1>

        <div className={styles.searchCard}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter City Name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.buttonWrap}>
              <button type="submit" className={styles.button}>
                Search
              </button>
            </div>
          </form>
        </div>

        <div className={styles.media}>
          <div className={styles.imageCard}>
            <img src={aqiImage} alt="AQI Chart" className={styles.image} />
          </div>
        </div>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} Air Quality Dashboard | All Rights Reserved
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
