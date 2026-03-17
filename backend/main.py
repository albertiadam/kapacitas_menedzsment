from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import engine, Base, get_db
from backend import models
from datetime import datetime
from typing import List

class ProjectCreate(BaseModel):
    name: str
    description: str
    start: datetime
    end: datetime
    revenue: float

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Adroit project backend API",
    description="Backend API for managing projects.",
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

@app.get("/projects")
def read_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Projects).all()
    return projects

@app.post("/projects")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Projects(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project