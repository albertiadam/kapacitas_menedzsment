from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="My FastAPI Backend",
    description="A simple FastAPI backend for demonstration purposes.",
    version="1.0.0",
)

@app.get("/")
def read_root():
    return {"message": "Heloka!"}