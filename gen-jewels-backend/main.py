import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import Base, engine
from app.controllers import auth, generation

# --- LIFESPAN MANAGER (Startup & Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Gen Jewels Backend...")
    
    # 1. Create Tables if they don't exist
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database Connected & Tables Verified.")
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")

    # 2. Ensure Storage Directory Exists
    if not os.path.exists("storage/generated_image"):
        os.makedirs("storage/generated_image")
        print("✅ Created 'storage/generated_image' directory.")

    yield
    print("🛑 Shutting down...")

app = FastAPI(title="Gen Jewels API", version="1.0", lifespan=lifespan)

# --- 1. CRITICAL: ENABLE CORS FOR NGROK ---
# This allows your Cloud Frontend (Vercel/Netlify) to talk to your Local Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all cloud domains
    allow_credentials=True,
    allow_methods=["*"],  # Allows all types of requests (GET, POST, etc.)
    allow_headers=["*"],
)

# --- 2. Mount Static Files (To view generated images) ---
# This makes http://your-ngrok-url.com/storage/generated_image/xyz.png valid
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# --- 3. Register Routers ---
app.include_router(auth.router)
app.include_router(generation.router)

# --- 4. Health Check (The "Doorbell" for Frontend) ---
@app.get("/health", tags=["System"])
def health_check():
    """
    Simple endpoint for the cloud frontend to verify the local backend is online.
    """
    return {
        "status": "online", 
        "message": "Gen Jewels Backend is Live!"
    }

@app.get("/")
def home():
    return {"message": "Welcome to Gen Jewels Backend API"}

# --- 5. Run Server ---
if __name__ == "__main__":
    print("🚀 Starting Gen Jewels Local Server...")
    # '0.0.0.0' is required for Ngrok to see the server
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)