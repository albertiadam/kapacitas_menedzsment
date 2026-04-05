from fastapi import Depends, FastAPI, HTTPException
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

@app.get("/projects", response_model=List[models.ProjectResponse])
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

@app.put("/projects/{project_id}")
def update_project(project_id: int, project_update: models.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(models.Projects).filter(models.Projects.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    
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

@app.put("/skills/{skill_id}")
def update_skill(skill_id: int, skill_update: models.SkillUpdate, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skills).filter(models.Skills.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    update_data = skill_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_skill, field, value)
    
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

@app.put("/employees/{employee_id}")
def update_employee(employee_id: int, employee_update: models.EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employees).filter(models.Employees.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = employee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
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

@app.put("/skills-employees/{skill_id}/{employee_id}")
def update_skill_employee(
    skill_id: int, 
    employee_id: int, 
    skill_employee_update: models.SkillEmployeeUpdate, 
    db: Session = Depends(get_db)
):
    db_skill_employee = db.query(models.SkillsEmployees).filter(
        models.SkillsEmployees.skill_id == skill_id,
        models.SkillsEmployees.employee_id == employee_id
    ).first()
    if not db_skill_employee:
        raise HTTPException(status_code=404, detail="Skill-employee relationship not found")
    
    update_data = skill_employee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_skill_employee, field, value)
    
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
    project = db.query(models.Projects).filter(models.Projects.id == project_skill_employee.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    skill = db.query(models.Skills).filter(models.Skills.id == project_skill_employee.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    employee = db.query(models.Employees).filter(models.Employees.id == project_skill_employee.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    skill_employee = db.query(models.SkillsEmployees).filter(
        models.SkillsEmployees.skill_id == project_skill_employee.skill_id,
        models.SkillsEmployees.employee_id == project_skill_employee.employee_id
    ).first()
    if not skill_employee:
        raise HTTPException(
            status_code=400, 
            detail=f"Employee {project_skill_employee.employee_id} does not have skill {project_skill_employee.skill_id}"
        )
    
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

@app.put("/project-skills-employees/{project_id}/{skill_id}/{employee_id}")
def update_project_skill_employee(
    project_id: int,
    skill_id: int,
    employee_id: int,
    project_skill_employee_update: models.ProjectSkillEmployeeUpdate,
    db: Session = Depends(get_db)
):
    db_project_skill_employee = db.query(models.ProjectSkillsEmployees).filter(
        models.ProjectSkillsEmployees.project_id == project_id,
        models.ProjectSkillsEmployees.skill_id == skill_id,
        models.ProjectSkillsEmployees.employee_id == employee_id
    ).first()
    if not db_project_skill_employee:
        raise HTTPException(status_code=404, detail="Project-skill-employee relationship not found")
    
    update_data = project_skill_employee_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project_skill_employee, field, value)
    
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

# GENERAL

@app.get("/employee-capacity/{employee_id}")
def get_employee_capacity(
    employee_id: int,
    start: str,
    end: str,
    db: Session = Depends(get_db)
):
    """
    Get employee capacity for a given time period.
    
    Query parameters:
    - start: ISO date string (YYYY-MM-DDTHH:MM:SS)
    - end: ISO date string (YYYY-MM-DDTHH:MM:SS)
    """
    try:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")
    
    employee = db.query(models.Employees).filter(models.Employees.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    capacity_info = employee.get_capacity_for_period(start_date, end_date, db)
    return capacity_info