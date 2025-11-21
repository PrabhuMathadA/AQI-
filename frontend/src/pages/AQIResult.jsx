import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/AQIResult.module.css";

const AQIResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 🔹 Handle missing state (user refreshed or opened page directly)
  if (!state) {
    return (
      <div className={styles.errorContainer}>
        <h2>⚠️ No AQI data found</h2>
        <p>Please go back and search for a city again.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className={styles.backButton}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // 🔹 Correct destructuring — use pollutants instead of components
  const {
    city = "Unknown",
    aqi = "-",
    status = "Unknown",
    pollutants = {},
  } = state;

  // 🔹 Determine AQI category color
  const statusClass =
  status && typeof status === "string"
    ? styles[status.toLowerCase().replace(/\s+/g, "-")]
    : "";


  // 🔹 Health messages
  let problems = [];
  let precautions = [];

  if (aqi <= 50) {
    problems = [
      "No health risks.",
      "Air quality is clean and fresh.",
      "Ideal for outdoor activities.",
      "No irritation to eyes or throat.",
      "Perfect visibility outdoors.",
    ];
    precautions = [
      "Enjoy outdoor activities.",
      "Keep windows open for ventilation.",
      "Maintain greenery around home.",
      "Stay hydrated and healthy.",
      "Continue normal lifestyle.",
    ];
  } else if (aqi <= 100) {
    problems = [
      "Mild irritation for sensitive people.",
      "Slight breathing discomfort during heavy exercise.",
      "Dust may affect asthma patients.",
      "Minor throat dryness.",
      "Slight fatigue for elders.",
    ];
    precautions = [
      "Sensitive individuals reduce heavy outdoor activity.",
      "Avoid exercising near traffic.",
      "Maintain indoor ventilation.",
      "Drink more water.",
      "Monitor AQI if you have asthma.",
    ];
  } else if (aqi <= 150) {
    problems = [
      "Asthmatics may face difficulty breathing.",
      "Children may develop mild cough.",
      "Elders may feel chest tightness.",
      "Outdoor air feels slightly polluted.",
      "Eye and nose irritation for sensitive people.",
    ];
    precautions = [
      "Limit outdoor activity.",
      "Wear a mask if needed.",
      "Avoid peak pollution hours.",
      "Keep asthma medication handy.",
      "Use indoor plants for purification.",
    ];
  } else if (aqi <= 200) {
    problems = [
      "Breathing discomfort for everyone.",
      "Noticeable throat irritation.",
      "Mild headaches may occur.",
      "Increased cough for asthma patients.",
      "Decrease in outdoor visibility.",
    ];
    precautions = [
      "Avoid outdoor exercise.",
      "Wear N95 mask outside.",
      "Close windows during peak hours.",
      "Use indoor air purifier.",
      "Drink warm water to reduce irritation.",
    ];
  } else if (aqi <= 300) {
    problems = [
      "Significant breathing issues.",
      "Eye burning and throat irritation.",
      "Chest tightness during normal activity.",
      "High risk for children and elders.",
      "Pollution may trigger respiratory issues.",
    ];
    precautions = [
      "Stay indoors as much as possible.",
      "Wear N95/N99 mask outdoors.",
      "Improve indoor air filtration.",
      "Avoid walking near roads.",
      "Follow government health advisories.",
    ];
  } else {
    problems = [
      "Severe risk of respiratory illness.",
      "Inflammation of eyes, nose, and lungs.",
      "Chest pain during exertion.",
      "Dangerous for pregnant women.",
      "Emergency-level pollution exposure.",
    ];
    precautions = [
      "Avoid going outdoors completely.",
      "Keep all windows and doors closed.",
      "Use HEPA air purifier.",
      "Wear N99 mask if going outside.",
      "Seek medical help if symptoms worsen.",
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

        {/* Pollutant Section */}
        <div className={styles.pollutantSection}>
          <h2>🌫️ Pollutant Concentrations</h2>
          <div className={styles.pollutantGrid}>
            {pollutants && Object.keys(pollutants).length > 0 ? (
              Object.entries(pollutants).map(([key, value]) => (
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
          <button
            onClick={() => navigate("/dashboard")}
            className={styles.backButton}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AQIResult;
