from fastapi import APIRouter, HTTPException
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")


@router.get("/")
def get_aqi(city: str):
    """
    Fetch AQI for the given city.
    1️⃣ Try OpenAQ (CPCB live data)
    2️⃣ Fallback: OpenWeather (scaled for Indian conditions)
    """

    try:
        # 1️⃣ Try fetching from OpenAQ (CPCB network)
        openaq_url = f"https://api.openaq.org/v2/latest?city={city}&country=IN"
        aq_response = requests.get(openaq_url, timeout=10)
        aq_data = aq_response.json()

        pm25 = None
        if "results" in aq_data and len(aq_data["results"]) > 0:
            for measurement in aq_data["results"][0]["measurements"]:
                if measurement["parameter"] == "pm25":
                    pm25 = measurement["value"]
                    break

        # 2️⃣ If no OpenAQ data, fallback to OpenWeather API
        if pm25 is None:
            # Get lat/lon from city
            geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHER_API_KEY}"
            geo_res = requests.get(geo_url, timeout=10).json()

            if not geo_res or isinstance(geo_res, dict):
                raise HTTPException(status_code=404, detail="City not found")

            lat, lon = geo_res[0]["lat"], geo_res[0]["lon"]

            # Fetch AQI data
            aqi_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
            ow_res = requests.get(aqi_url, timeout=10).json()

            if "list" not in ow_res or not ow_res["list"]:
                raise HTTPException(status_code=404, detail="No AQI data found")

            components = ow_res["list"][0]["components"]
            pm25 = components.get("pm2_5", 0) * 2.0  # correction for India
        else:
            components = {"pm2_5": pm25}

        # 3️⃣ Convert PM2.5 → Indian AQI (CPCB formula)
        if pm25 <= 30:
            aqi_value = pm25 * (50 / 30)
        elif pm25 <= 60:
            aqi_value = 50 + (pm25 - 30) * (50 / 30)
        elif pm25 <= 90:
            aqi_value = 100 + (pm25 - 60) * (100 / 30)
        elif pm25 <= 120:
            aqi_value = 200 + (pm25 - 90) * (100 / 30)
        elif pm25 <= 250:
            aqi_value = 300 + (pm25 - 120) * (100 / 130)
        else:
            aqi_value = 400 + (pm25 - 250) * (100 / 130)

        # 4️⃣ Map AQI to Indian category
        if aqi_value <= 50:
            status = "Good"
        elif aqi_value <= 100:
            status = "Satisfactory"
        elif aqi_value <= 200:
            status = "Moderate"
        elif aqi_value <= 300:
            status = "Poor"
        elif aqi_value <= 400:
            status = "Very Poor"
        else:
            status = "Severe"

        return {
            "city": city.title(),
            "aqi": round(aqi_value, 1),
            "status": status,
            "pm2_5": round(pm25, 2),
            "components": components,
            "source": "OpenAQ" if pm25 and components.get("pm2_5") == pm25 else "OpenWeather"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching AQI: {str(e)}")
