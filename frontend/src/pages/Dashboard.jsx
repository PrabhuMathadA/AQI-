import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";
import aqiImage from "../assets/bg.jpg";

const Dashboard = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!city.trim()) {
      alert("Please enter a city name.");
      return;
    }

    try {
      // ✅ Add trailing slash to match FastAPI route
      const res = await fetch(`http://127.0.0.1:8000/aqi/?city=${city}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch AQI for ${city}`);
      }

      const data = await res.json();
      console.log("✅ AQI API Response:", data);

      // ✅ Pass all relevant data to AQIResult
      navigate("/result", {
        state: {
          city: data.city,
          aqi: data.aqi,
          status: data.status,
          components: data.components,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching AQI:", error);
      alert("Could not fetch live AQI data. Please check your API or city name.");
    }
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
