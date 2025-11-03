import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/AQIResult.module.css";

const AQIResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 🔹 Handle missing state (user refreshed or navigated directly)
  if (!state) {
    return (
      <div className={styles.errorContainer}>
        <h2>⚠️ No AQI data found</h2>
        <p>Please go back and search for a city again.</p>
        <button onClick={() => navigate("/dashboard")} className={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // 🔹 Safely destructure state with fallbacks
  const { city = "Unknown", aqi = "-", status = "Unknown", components = {} } = state;

  // 🔹 Determine color safely
  const statusClass =
    status && typeof status === "string"
      ? styles[status.toLowerCase().replace(/\s+/g, "")]
      : "";

  // 🔹 Health messages
  let problems = [];
  let precautions = [];

  if (aqi <= 50) {
    problems = [
      "Air quality is clean and fresh.",
      "No known health risks.",
      "Ideal for outdoor activities.",
      "No irritation to eyes or throat.",
      "Safe for children and elderly people."
    ];
    precautions = [
      "Enjoy outdoor workouts and walks.",
      "Keep windows open for ventilation.",
      "Maintain indoor air circulation.",
      "Continue eco-friendly habits.",
      "Stay hydrated and maintain greenery."
    ];
  } else if (aqi <= 150) {
    problems = [
      "Slight irritation to sensitive groups.",
      "Possible mild coughing or throat dryness.",
      "Asthmatics may feel mild discomfort.",
      "Slight decrease in outdoor visibility.",
      "Sensitive children or elders may feel tired easily."
    ];
    precautions = [
      "Limit extended outdoor exposure.",
      "Avoid heavy outdoor exercise during peak hours.",
      "Keep windows closed in early morning and evening.",
      "Use air purifiers indoors if possible.",
      "Monitor local AQI regularly."
    ];
  } else {
    problems = [
      "Increased risk of respiratory illness.",
      "Eye, nose, and throat irritation.",
      "Difficulty in breathing during exertion.",
      "People with asthma may have severe reactions.",
      "Fatigue and headaches due to poor oxygen levels."
    ];
    precautions = [
      "Avoid outdoor activities and wear N95 masks if necessary.",
      "Use air purifiers or stay indoors in filtered air.",
      "Close windows and doors to block polluted air.",
      "Drink more water to flush out toxins.",
      "Consult doctors if coughing or irritation persists."
    ];
  }

  return (
    <div className={styles.resultContainer}>
      <div className={styles.card}>
        {/* Top Section */}
        <div className={styles.topSection}>
          <h1 className={styles.cityName}>{city}</h1>
          <p className={styles.aqiValue}>
            AQI: <span>{aqi}</span>
          </p>
          <p className={`${styles.category} ${statusClass}`}>{status}</p>
        </div>

        {/* Pollutant Details */}
        <div className={styles.pollutantSection}>
          <h2>🌫️ Pollutant Concentrations</h2>
          <div className={styles.pollutantGrid}>
            {components && Object.keys(components).length > 0 ? (
              Object.entries(components).map(([key, value]) => (
                <div key={key} className={styles.pollutantCard}>
                  <h3>{key.toUpperCase()}</h3>
                  <p>{value}</p>
                  <span>μg/m³</span>
                </div>
              ))
            ) : (
              <p>No pollutant data available</p>
            )}
          </div>
        </div>

        {/* Health Impacts */}
        <div className={styles.middleSection}>
          <h2>💨 Possible Health Impacts</h2>
          <ul>
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Precautions */}
        <div className={styles.bottomSection}>
          <h2>✅ Recommended Precautions</h2>
          <ul>
            {precautions.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <button onClick={() => navigate("/dashboard")} className={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AQIResult;
