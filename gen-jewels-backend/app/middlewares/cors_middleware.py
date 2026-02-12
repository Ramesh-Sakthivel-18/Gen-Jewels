from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

def add_cors_middleware(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, change "*" to your frontend URL
        allow_credentials=True,
        allow_methods=["*"],  # Allows GET, POST, PUT, DELETE
        allow_headers=["*"],
    )