from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import engine, Base, get_db
from backend import models
from datetime import datetime
from typing import List


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

# DEFAULT

@app.get("/")
def read_root():
    return {"message": "Heloka!"}


# PROJECTS

@app.get("/projects")
def read_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Projects).all()
    return projects

@app.post("/projects")
def create_project(project: models.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Projects(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


# SKILLS

@app.get("/skills")
def read_skills(db: Session = Depends(get_db)):
    skills = db.query(models.Skills).all()
    return skills

@app.post("/skills")
def create_skill(skill: models.SkillCreate, db: Session = Depends(get_db)):
    db_skill = models.Skills(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

# EMPLOYEES

@app.get("/employees")
def read_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employees).all()
    return employees

@app.post("/employees")
def create_employee(employee: models.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = models.Employees(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

# SKILL-EMPLOYEE
@app.get("/skills-employees")
def read_skills_employees(db: Session = Depends(get_db)):
    skills_employees = db.query(models.SkillsEmployees).all()
    return [
        {
            "skill_id": se.skill_id,
            "employee_id": se.employee_id,
            "skill_name": se.skill.name,
            "employee_name": se.employee.name,
            "proficiency": se.proficiency
        }
        for se in skills_employees
    ]

@app.post("/skills-employees")
def create_skill_employee(skill_employee: models.SkillEmployeeCreate, db: Session = Depends(get_db
)):
    db_skill_employee = models.SkillsEmployees(**skill_employee.model_dump())
    db.add(db_skill_employee)
    db.commit()
    db.refresh(db_skill_employee)
    return {
        "skill_id": db_skill_employee.skill_id,
        "employee_id": db_skill_employee.employee_id,
        "skill_name": db_skill_employee.skill.name,
        "employee_name": db_skill_employee.employee.name,
        "proficiency": db_skill_employee.proficiency
    }

# PROJECT-SKILL-EMPLOYEE

@app.get("/project-skills-employees")
def read_project_skills_employees(db: Session = Depends(get_db)):
    project_skills_employees = db.query(models.ProjectSkillsEmployees).all()
    return [
        {
            "project_id": pse.project_id,
            "skill_id": pse.skill_id,
            "employee_id": pse.employee_id,
            "project_name": pse.project.name,
            "skill_name": pse.skill.name,
            "employee_name": pse.employee.name,
            "needed_proficiency": pse.needed_proficiency,
            "capacity_on_project": pse.capacity_on_project,
            "skill_start": pse.skill_start,
            "skill_end": pse.skill_end
        }
        for pse in project_skills_employees
    ]

@app.post("/project-skills-employees")
def create_project_skill_employee(project_skill_employee: models.ProjectSkillEmployeeCreate, db: Session = Depends(get_db)):
    db_project_skill_employee = models.ProjectSkillsEmployees(**project_skill_employee.model_dump())
    db.add(db_project_skill_employee)
    db.commit()
    db.refresh(db_project_skill_employee)
    return {
        "project_id": db_project_skill_employee.project_id,
        "skill_id": db_project_skill_employee.skill_id,
        "employee_id": db_project_skill_employee.employee_id,
        "project_name": db_project_skill_employee.project.name,
        "skill_name": db_project_skill_employee.skill.name,
        "employee_name": db_project_skill_employee.employee.name,
        "needed_proficiency": db_project_skill_employee.needed_proficiency,
        "capacity_on_project": db_project_skill_employee.capacity_on_project,
        "skill_start": db_project_skill_employee.skill_start,
        "skill_end": db_project_skill_employee.skill_end
    }