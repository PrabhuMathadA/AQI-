# /mnt/data/aqi_service.py
"""
Final AQI service — "Highest nearby WAQI station" logic (Google-like)

Behavior:
1. Resolve city -> coordinates (OpenWeather Geo API)
2. Query WAQI map/bounds for stations in expanding bounding boxes around the city
3. For every station found, fetch WAQI feed (geo:<lat>;<lon>) and collect AQI + pollutants
4. Filter out invalid results; compute CPCB AQI from PM2.5 if WAQI feed lacks numeric AQI
5. Choose the station with the HIGHEST AQI (Google-like) and return that
6. If no WAQI stations found, fallback to OpenWeather air_pollution for the city's coords,
   compute CPCB AQI from pm2_5 and return (with source="OpenWeather (fallback)")
7. Response includes diagnostics: list of nearby stations (aqi, distance), chosen station, source
"""

from fastapi import APIRouter, HTTPException
import requests
import os
from dotenv import load_dotenv
from pathlib import Path
from math import radians, sin, cos, sqrt, atan2
from typing import Optional, List, Dict, Any

# Load environment (.env expected in project root)
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

router = APIRouter()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
WAQI_TOKEN = os.getenv("WAQI_TOKEN") or "1e4ba7bb70598354d28503e0fd24cf66fff1e4b6"

# CPCB / US-EPA PM2.5 breakpoints used to compute AQI (same as Google/AQICN)
BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

# ---------------- utility functions ----------------
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    rlat1, rlon1, rlat2, rlon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = rlat2 - rlat1
    dlon = rlon2 - rlon1
    a = sin(dlat/2)**2 + cos(rlat1) * cos(rlat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def compute_cpcb_aqi(pm25: Optional[float]) -> Optional[int]:
    if pm25 is None:
        return None
    try:
        pm = float(pm25)
    except (TypeError, ValueError):
        return None
    for bp_low, bp_high, aqi_low, aqi_high in BREAKPOINTS:
        if bp_low <= pm <= bp_high:
            aqi = ((aqi_high - aqi_low) / (bp_high - bp_low)) * (pm - bp_low) + aqi_low
            return int(round(aqi))
    return 500

def aqi_category(aqi: Optional[int]) -> str:
    if aqi is None:
        return "Unknown"
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"

# ---------------- OpenWeather geocoding ----------------
def get_coords_for_city(city: str):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY missing in environment")
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={requests.utils.quote(city)}&limit=1&appid={OPENWEATHER_API_KEY}"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        data = res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error fetching coordinates: {e}")
    if not data:
        raise HTTPException(status_code=404, detail=f"City not found: {city}")
    entry = data[0]
    return entry.get("lat"), entry.get("lon"), entry.get("name") or city.title()

# ---------------- WAQI map bounds search (stations list) ----------------
def waqi_map_bounds(minLat: float, minLon: float, maxLat: float, maxLon: float) -> List[Dict[str, Any]]:
    if not WAQI_TOKEN:
        return []
    url = f"https://api.waqi.info/map/bounds/?token={WAQI_TOKEN}&latlng={minLat},{minLon},{maxLat},{maxLon}"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        j = res.json()
        if isinstance(j, dict) and j.get("data"):
            return j.get("data", [])
    except requests.RequestException:
        return []
    return []

def search_nearby_waqi_stations(lat: float, lon: float, initial_delta=0.25, max_delta=3.0) -> List[Dict[str, Any]]:
    delta = initial_delta
    stations = []
    while delta <= max_delta:
        minLat = lat - delta
        minLon = lon - delta
        maxLat = lat + delta
        maxLon = lon + delta
        data = waqi_map_bounds(minLat, minLon, maxLat, maxLon)
        if data:
            # return all stations found (we will compute distances later)
            return data
        delta *= 2
    return stations

# ---------------- WAQI feed fetch ----------------
def fetch_waqi_feed_for_station(station_lat: float, station_lon: float) -> Optional[Dict[str, Any]]:
    url = f"https://api.waqi.info/feed/geo:{station_lat};{station_lon}/?token={WAQI_TOKEN}"
    try:
        res = requests.get(url, timeout=8)
        res.raise_for_status()
        j = res.json()
        if isinstance(j, dict) and j.get("status") == "ok" and isinstance(j.get("data"), dict):
            return j["data"]
    except requests.RequestException:
        return None
    return None

# ---------------- OpenWeather pollution fetch ----------------
def fetch_openweather_pollution(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    if not OPENWEATHER_API_KEY:
        return None
    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        return res.json()
    except requests.RequestException:
        return None

# ---------------- main endpoint ----------------
@router.get("/")
def get_aqi(city: str):
    """
    Smart, Google-like AQI endpoint. Returns the HIGHEST AQI from nearby WAQI stations (PM2.5 preferred).
    Response includes:
      - chosen_station (highest AQI)
      - chosen_aqi, status
      - chosen station pollutants
      - list of nearby stations (aqi, distance)
      - source (WAQI / OpenWeather fallback)
    """
    if not city or not city.strip():
        raise HTTPException(status_code=400, detail="city query param required")
    city_q = city.strip()

    # Step 1: resolve coordinates
    lat, lon, display_name = get_coords_for_city(city_q)

    # Step 2: find WAQI stations nearby (map bounds)
    stations_raw = search_nearby_waqi_stations(lat, lon, initial_delta=0.25, max_delta=3.0)

    station_summaries = []  # will hold {name, lat, lon, aqi, pm25, distance_km, feed_ok}

    # For every station in stations_raw fetch feed and compute useful values
    for s in stations_raw:
        try:
            s_lat = float(s.get("lat"))
            s_lon = float(s.get("lon"))
        except Exception:
            continue
        # compute distance
        dist_km = haversine_km(lat, lon, s_lat, s_lon)
        # fetch feed
        feed = fetch_waqi_feed_for_station(s_lat, s_lon)
        if not feed:
            # record station with no feed
            station_summaries.append({
                "station_name": s.get("station", {}).get("name") or s.get("uid") or "unknown",
                "lat": s_lat,
                "lon": s_lon,
                "distance_km": round(dist_km, 2),
                "aqi": None,
                "pm25": None,
                "pm10": None,
                "feed_ok": False
            })
            continue

        iaqi = feed.get("iaqi", {})
        pm25 = iaqi.get("pm25", {}).get("v") if iaqi.get("pm25") else None
        pm10 = iaqi.get("pm10", {}).get("v") if iaqi.get("pm10") else None
        # WAQI returns "aqi" which is CPCB-style integer or sometimes '-'/None
        raw_aqi = feed.get("aqi")
        computed_aqi = None
        if isinstance(raw_aqi, (int, float)):
            computed_aqi = int(raw_aqi)
        else:
            # try compute from pm25
            if pm25 is not None:
                computed_aqi = compute_cpcb_aqi(pm25)
        station_summaries.append({
            "station_name": feed.get("city", {}).get("name") or s.get("station", {}).get("name") if s.get("station") else s.get("uid"),
            "lat": s_lat,
            "lon": s_lon,
            "distance_km": round(dist_km, 2),
            "aqi": computed_aqi,
            "pm25": pm25,
            "pm10": pm10,
            "feed_ok": True
        })

    # Step 3: choose station with HIGHEST AQI among those with numeric AQI
    stations_with_aqi = [st for st in station_summaries if st.get("aqi") is not None]
    chosen = None
    if stations_with_aqi:
        # pick the station with maximum AQI; tie-breaker: smaller distance
        stations_with_aqi.sort(key=lambda x: (-x["aqi"], x["distance_km"]))
        chosen = stations_with_aqi[0]
        # fetch that station's feed (again) to get pollutant components if not present
        feed = fetch_waqi_feed_for_station(chosen["lat"], chosen["lon"])
        if feed and feed.get("status", "ok") == "ok":
            iaqi = feed.get("iaqi", {})
            pm25 = iaqi.get("pm25", {}).get("v") if iaqi.get("pm25") else None
            pm10 = iaqi.get("pm10", {}).get("v") if iaqi.get("pm10") else None
            no2 = iaqi.get("no2", {}).get("v") if iaqi.get("no2") else None
            o3 = iaqi.get("o3", {}).get("v") if iaqi.get("o3") else None
            co = iaqi.get("co", {}).get("v") if iaqi.get("co") else None
            aqi_value = feed.get("aqi")
            if not isinstance(aqi_value, (int, float)) and pm25 is not None:
                aqi_value = compute_cpcb_aqi(pm25)
            return {
                "city": display_name,
                "chosen_station": feed.get("city", {}).get("name"),
                "chosen_lat": chosen["lat"],
                "chosen_lon": chosen["lon"],
                "aqi": int(aqi_value) if aqi_value is not None else None,
                "status": aqi_category(aqi_value),
                "pollutants": {
                    "pm2_5": pm25,
                    "pm10": pm10,
                    "no2": no2,
                    "o3": o3,
                    "co": co
                },
                "stations_considered": stations_with_aqi,
                "source": "WAQI (highest nearby station)"
            }

    # If we got here, either no WAQI stations reported numeric AQI or no stations found
    # If we have some stations but none had numeric AQI, try to choose the station with highest pm25
    stations_with_pm25 = [st for st in station_summaries if st.get("pm25") is not None]
    if stations_with_pm25:
        # pick station with highest pm25 (tie-breaker distance)
        stations_with_pm25.sort(key=lambda x: (-float(x["pm25"]), x["distance_km"]))
        chosen = stations_with_pm25[0]
        feed = fetch_waqi_feed_for_station(chosen["lat"], chosen["lon"])
        if feed and feed.get("status") == "ok":
            iaqi = feed.get("iaqi", {})
            pm25 = iaqi.get("pm25", {}).get("v") if iaqi.get("pm25") else None
            pm10 = iaqi.get("pm10", {}).get("v") if iaqi.get("pm10") else None
            no2 = iaqi.get("no2", {}).get("v") if iaqi.get("no2") else None
            o3 = iaqi.get("o3", {}).get("v") if iaqi.get("o3") else None
            co = iaqi.get("co", {}).get("v") if iaqi.get("co") else None
            aqi_value = None
            if pm25 is not None:
                aqi_value = compute_cpcb_aqi(pm25)
            return {
                "city": display_name,
                "chosen_station": feed.get("city", {}).get("name"),
                "chosen_lat": chosen["lat"],
                "chosen_lon": chosen["lon"],
                "aqi": int(aqi_value) if aqi_value is not None else None,
                "status": aqi_category(aqi_value),
                "pollutants": {
                    "pm2_5": pm25,
                    "pm10": pm10,
                    "no2": no2,
                    "o3": o3,
                    "co": co
                },
                "stations_considered": station_summaries,
                "source": "WAQI (highest nearby by pm25)"
            }

    # Step 4: No WAQI station data usable — fallback to OpenWeather air_pollution
    ow = fetch_openweather_pollution(lat, lon)
    if not ow or "list" not in ow or not ow["list"]:
        raise HTTPException(status_code=502, detail="No air quality data available from WAQI or OpenWeather")
    comps = ow["list"][0].get("components", {})
    pm25 = comps.get("pm2_5")
    computed_aqi = compute_cpcb_aqi(pm25) if pm25 is not None else None

    return {
        "city": display_name,
        "chosen_station": "OpenWeather Model (fallback)",
        "chosen_lat": lat,
        "chosen_lon": lon,
        "aqi": computed_aqi,
        "status": aqi_category(computed_aqi),
        "pollutants": comps,
        "stations_considered": station_summaries,
        "source": "OpenWeather (fallback)"
    }
