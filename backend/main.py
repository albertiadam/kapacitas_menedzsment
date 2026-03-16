from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(
    title="My FastAPI Backend",
    description="A simple FastAPI backend for demonstration purposes.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Fejlesztés alatt bárhonnan jöhet kérés
    allow_credentials=True,
    allow_methods=["*"],  # Engedélyezzük a GET, POST stb. kéréseket
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Heloka!"}

@app.get("/kalap")
def get_kalap():
    return {"kalap": "Ez egy kalap!"}

@app.get("/kalap/{kalap_id}")
def get_kalap_by_id(kalap_id: int):
    asd = {
        1: "Kalap1",
        2: "Kalap2",
    }
    return {"kalap":asd.get(kalap_id, "Nincs ilyen kalap")}