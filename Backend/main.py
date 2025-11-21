from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from aqi_service import router as aqi_router

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(aqi_router, prefix="/aqi", tags=["AQI Data"])

@app.get("/")
def home():
    return {"message": "AQI Backend Running ✅"}

@app.get("/test-env")
def test_env():
    import os
    return {
        "waqi": os.getenv("WAQI_TOKEN"),
        "ow": os.getenv("OPENWEATHER_API_KEY")
    }
