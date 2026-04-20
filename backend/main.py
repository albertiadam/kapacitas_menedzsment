from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.database import engine, Base, get_db
from backend import models
from datetime import datetime, timedelta
from typing import List
from backend.constants import DAILY_HOUR_WORK


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
    return {"message": "Capacity management system"}


# PROJECTS

@app.get("/projects", response_model=List[models.ProjectResponse])
def read_projects(db: Session = Depends(get_db)) -> List[models.ProjectResponse]:
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

    new_start = update_data.get('start', db_project.start)
    new_end = update_data.get('end', db_project.end)

    if new_start is not None and new_end is not None and new_end <= new_start:
        raise HTTPException(status_code=400, detail="end must be after start")

    if 'end' in update_data and 'start' not in update_data and new_end <= db_project.start:
        raise HTTPException(status_code=400, detail="end must be after current project start")

    if 'start' in update_data and 'end' not in update_data and new_start >= db_project.end:
        raise HTTPException(status_code=400, detail="start must be before current project end")

    for field, value in update_data.items():
        setattr(db_project, field, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    """
    Delete a project by ID.
    """
    db_project = db.query(models.Projects).filter(models.Projects.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

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

@app.delete("/skills/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    """
    Delete a skill by ID.
    """
    db_skill = db.query(models.Skills).filter(models.Skills.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    db.delete(db_skill)
    db.commit()
    return {"message": "Skill deleted successfully"}

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

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Delete an employee by ID.
    """
    db_employee = db.query(models.Employees).filter(models.Employees.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted successfully"}

# SKILL-EMPLOYEE

@app.get("/skills-employees")
def read_skills_employees(db: Session = Depends(get_db)):
    """
    Get all skill-employee relationships with skill and employee names.
    """
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
    """
    Create a new skill-employee relationship.
    """
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
    """
    Update skill-employee relationship.
    """
    db_skill_employee = db.query(models.SkillsEmployees).filter(
        models.SkillsEmployees.skill_id == skill_id,
        models.SkillsEmployees.employee_id == employee_id
    ).first()
    if not db_skill_employee:
        raise HTTPException(status_code=404, detail="Skill-employee relationship not found")
    
    update_data = skill_employee_update.model_dump(exclude_unset=True)

    new_skill_id = update_data.get('skill_id', skill_id)
    new_employee_id = update_data.get('employee_id', employee_id)
    if new_skill_id != skill_id or new_employee_id != employee_id:
        skill_employee_check = db.query(models.SkillsEmployees).filter(
            models.SkillsEmployees.skill_id == new_skill_id,
            models.SkillsEmployees.employee_id == new_employee_id
        ).first()
        if not skill_employee_check:
            raise HTTPException(
                status_code=400, 
                detail=f"Employee {new_employee_id} does not have skill {new_skill_id}"
            )

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

@app.delete("/skills-employees/{skill_id}/{employee_id}")
def delete_skill_employee(skill_id: int, employee_id: int, db: Session = Depends(get_db)):
    """
    Delete skill-employee relationship.
    """
    db_skill_employee = db.query(models.SkillsEmployees).filter(
        models.SkillsEmployees.skill_id == skill_id,
        models.SkillsEmployees.employee_id == employee_id
    ).first()
    if not db_skill_employee:
        raise HTTPException(status_code=404, detail="Skill-employee relationship not found")
    
    db.delete(db_skill_employee)
    db.commit()
    return {"message": "Skill-employee relationship deleted successfully"}

# PROJECT-SKILL-EMPLOYEE

@app.get("/project-skills-employees")
def read_project_skills_employees(db: Session = Depends(get_db)):
    """
    Get all project-skill-employee relationships with project, skill, and employee names.
    """
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
            "capacity_worked_on_project": pse.capacity_worked_on_project,
            "skill_start": pse.skill_start,
            "skill_end": pse.skill_end
        }
        for pse in project_skills_employees
    ]

@app.post("/project-skills-employees")
def create_project_skill_employee(
    project_skill_employee: models.ProjectSkillEmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new project-skill-employee relationship.
    
    Validations:
    - Project, skill, and employee must exist
    - Employee must have the skill assigned
    - Skill assignment start date cannot be before project start date
    - Skill assignment end date cannot be after project end date
    """
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

    if project_skill_employee.skill_start < project.start:
        raise HTTPException(
            status_code=400,
            detail=f"Skill assignment start date ({project_skill_employee.skill_start}) cannot be before project start date ({project.start})"
        )
    
    if project_skill_employee.skill_end > project.end:
        raise HTTPException(
            status_code=400,
            detail=f"Skill assignment end date ({project_skill_employee.skill_end}) cannot be after project end date ({project.end})"
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
    """
    Update project-skill-employee relationship.
    
    Path parameters:
    - project_id: ID of the project
    - skill_id: ID of the skill
    - employee_id: ID of the employee
    """
    db_project_skill_employee = db.query(models.ProjectSkillsEmployees).filter(
        models.ProjectSkillsEmployees.project_id == project_id,
        models.ProjectSkillsEmployees.skill_id == skill_id,
        models.ProjectSkillsEmployees.employee_id == employee_id
    ).first()
    if not db_project_skill_employee:
        raise HTTPException(status_code=404, detail="Project-skill-employee relationship not found")
    
    update_data = project_skill_employee_update.model_dump(exclude_unset=True)
    
    new_skill_id = update_data.get('skill_id', skill_id)
    new_employee_id = update_data.get('employee_id', employee_id)
    
    if new_skill_id != skill_id or new_employee_id != employee_id:
        skill_employee_check = db.query(models.SkillsEmployees).filter(
            models.SkillsEmployees.skill_id == new_skill_id,
            models.SkillsEmployees.employee_id == new_employee_id
        ).first()
        if not skill_employee_check:
            raise HTTPException(
                status_code=400, 
                detail=f"Employee {new_employee_id} does not have skill {new_skill_id}"
            )
    
    new_skill_start = update_data.get('skill_start', db_project_skill_employee.skill_start)
    new_skill_end = update_data.get('skill_end', db_project_skill_employee.skill_end)
    
    if new_skill_start != db_project_skill_employee.skill_start or new_skill_end != db_project_skill_employee.skill_end:
        if new_skill_start < db_project_skill_employee.project.start:
            raise HTTPException(
                status_code=400,
                detail=f"Skill assignment start date ({new_skill_start}) cannot be before project start date ({db_project_skill_employee.project.start})"
            )
        
        if new_skill_end > db_project_skill_employee.project.end:
            raise HTTPException(
                status_code=400,
                detail=f"Skill assignment end date ({new_skill_end}) cannot be after project end date ({db_project_skill_employee.project.end})"
            )
    
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

@app.delete("/project-skills-employees/{project_id}/{skill_id}/{employee_id}")
def delete_project_skill_employee(
    project_id: int,
    skill_id: int,
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete project-skill-employee relationship.
    """
    db_project_skill_employee = db.query(models.ProjectSkillsEmployees).filter(
        models.ProjectSkillsEmployees.project_id == project_id,
        models.ProjectSkillsEmployees.skill_id == skill_id,
        models.ProjectSkillsEmployees.employee_id == employee_id
    ).first()
    if not db_project_skill_employee:
        raise HTTPException(status_code=404, detail="Project-skill-employee relationship not found")
    
    db.delete(db_project_skill_employee)
    db.commit()
    return {"message": "Project-skill-employee relationship deleted successfully"}

# EMPLOYEE CAPACITIES

@app.get("/employee-capacities")
def get_employee_get_employee_capacities(
    start: str,
    end: str,
    db: Session = Depends(get_db),
):
    """
    Get capacities for all employees for a given time period.
    
    Query parameters:
    - start: ISO date string (YYYY-MM-DDTHH:MM:SS)
    - end: ISO date string (YYYY-MM-DDTHH:MM:SS)
    """
    try:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")
    
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    
    db_employees = db.query(models.Employees).all()
    employee_capacities = []
    for employee in db_employees:
        capacity_info = employee.get_capacity_for_period(start_date, end_date, db)
        employee_capacities.append({
            **employee.to_dict(),
            **capacity_info
        })
    return employee_capacities

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
    - employee_id: ID of the employee
    - start: ISO date string (YYYY-MM-DDTHH:MM:SS)
    - end: ISO date string (YYYY-MM-DDTHH:MM:SS)
    """
    try:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")
    
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")

    employee = db.query(models.Employees).filter(models.Employees.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    capacity_info = employee.get_capacity_for_period(start_date, end_date, db)
    return capacity_info

@app.get("/get-available-employee-by-skill")
def get_available_employee_by_skill(
    skill_id: int,
    start: str,
    end: str,
    proficiency: int = 1,
    needed_capacity: float = 0.0,
    db: Session = Depends(get_db)
):
    """
    Get available employees for a given skill and time period.
    
    Query parameters:
    - skill_id: ID of the skill
    - start: ISO date string (YYYY-MM-DDTHH:MM:SS)
    - end: ISO date string (YYYY-MM-DDTHH:MM:SS)
    - proficiency: minimum proficiency level (default: 1)
    - needed_capacity: minimum needed capacity (default: 0.0)
    """
    try:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")
    
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")

    skill_employees = db.query(models.SkillsEmployees).join(models.Employees).filter(
        models.SkillsEmployees.skill_id == skill_id,
        models.SkillsEmployees.proficiency >= proficiency
    ).all()
    
    available_employees = []
    for skill_employee in skill_employees:
        employee = skill_employee.employee
        capacity_info = employee.get_capacity_for_period(start_date, end_date, db)
        employee_data = {
            'proficiency': skill_employee.proficiency,
            **employee.to_dict(),
            **capacity_info,
        }
        if capacity_info['available_capacity'] >= needed_capacity:
            employee_data['availability'] = 'fully'
        elif (employee.base_capacity - capacity_info['allocated_capacity']) > needed_capacity:
            employee_data['availability'] = 'partially'
        else:
            employee_data['availability'] = 'not'
        available_employees.append(employee_data)
    
    return available_employees


@app.post("/suggest-team")
def suggest_team(request: models.SuggestTeamRequest, db: Session = Depends(get_db)):
    """Suggest a team based on skill-specific date ranges and user preference."""
    team = []
    skill_lookup = {skill.id: skill.name for skill in db.query(models.Skills).all()}

    assigned_capacity: dict[int, float] = {}

    for requirement in request.skills:
        candidates = get_available_employee_by_skill(
            skill_id=requirement.skill_id,
            start=requirement.start.isoformat(),
            end=requirement.end.isoformat(),
            proficiency=requirement.needed_proficiency,
            needed_capacity=requirement.needed_capacity,
            db=db,
        )

        candidate_options = []
        for candidate in candidates:
            if candidate.get('availability') != 'fully':
                continue

            used_capacity = assigned_capacity.get(candidate['id'], 0.0)
            effective_available = candidate['available_capacity'] - used_capacity
            if effective_available >= requirement.needed_capacity:
                candidate_options.append((candidate, effective_available))

        if not candidate_options:
            skill_name = skill_lookup.get(requirement.skill_id, f"skill {requirement.skill_id}")
            raise HTTPException(
                status_code=404,
                detail=f"No fully available employee found for skill {skill_name} with required proficiency and capacity"
            )

        business_days = count_business_days(requirement.start, requirement.end)

        def candidate_cost(candidate):
            return candidate['hourly_rate'] * requirement.needed_capacity * DAILY_HOUR_WORK * (business_days + 1)

        if request.preference == 'cost':
            best_candidate, best_effective = min(
                candidate_options,
                key=lambda item: (candidate_cost(item[0]), item[1])
            )
        else:
            best_candidate, best_effective = min(
                candidate_options,
                key=lambda item: (item[1], candidate_cost(item[0]))
            )

        assigned_capacity[best_candidate['id']] = assigned_capacity.get(best_candidate['id'], 0.0) + requirement.needed_capacity

        team.append({
            'skill_id': requirement.skill_id,
            'skill_name': skill_lookup.get(requirement.skill_id, None),
            'employee_id': best_candidate['id'],
            'employee_name': best_candidate['name'],
            'proficiency': best_candidate['proficiency'],
            'needed_proficiency': requirement.needed_proficiency,
            'needed_capacity': requirement.needed_capacity,
            'available_capacity': best_effective,
            'hourly_rate': best_candidate['hourly_rate'],
            'estimated_cost': candidate_cost(best_candidate),
            'start': requirement.start,
            'end': requirement.end,
        })

    return {
        'preference': request.preference,
        'team': team,
    }

# GENERAL

@app.get("/delete-db")
def delete_db(db: Session = Depends(get_db)):
    """
    Delete all data from the database.
    """
    db.query(models.ProjectSkillsEmployees).delete()
    db.query(models.SkillsEmployees).delete()
    db.query(models.Projects).delete()
    db.query(models.Skills).delete()
    db.query(models.Employees).delete()
    db.commit()
    return {"message": "Database cleared"}


def count_business_days(start_date: datetime, end_date: datetime) -> int:
    days = 0
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() < 5:
            days += 1
        current_date += timedelta(days=1)
    return days
