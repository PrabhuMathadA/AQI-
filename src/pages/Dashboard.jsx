import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";
import aqiImage from "../assets/bg.jpg";

const Dashboard = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      alert("Please enter a city name.");
      return;
    }

    // Mock AQI values (for demo — you can connect to an API later)
    const aqiValue = Math.floor(Math.random() * 400);
    const maxAQI = aqiValue + 50;
    const minAQI = aqiValue - 50 > 0 ? aqiValue - 50 : 10;

    navigate("/result", {
      state: { city, aqiValue, maxAQI, minAQI },
    });
  };

  return (
    <div className={styles.container}>
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
