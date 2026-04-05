from sqlalchemy import Column,Integer,String,Float,Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, Session
from .database import Base
from datetime import datetime, timedelta
import calendar
from pydantic import BaseModel, field_validator
from .constants import DAILY_HOUR_WORK
import calendar
import enum

# Enums

class ProjectStatus(enum.Enum):
    PLANNED = "planned"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

def is_business_day(date: datetime) -> bool:
    """Check if a date is a business day (Monday-Friday)."""
    return date.weekday() < 5

# GET MODELS (db tables)

class Projects(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNED)
    short_name = Column(String)
    description = Column(String)
    start = Column(DateTime)
    end = Column(DateTime)
    fix_cost = Column(Float)
    revenue = Column(Float)
    project_skills_employees = relationship("ProjectSkillsEmployees", back_populates="project")

    @property
    def employee_cost(self):
        """Calculate total employee cost based on hourly rates and capacity on project, considering business days."""
        total_cost = 0
        for pse in self.project_skills_employees:
            business_days = 0
            current_date = pse.skill_start
            while current_date <= pse.skill_end:
                if is_business_day(current_date):
                    business_days += 1
                current_date += timedelta(days=1)
            
            total_cost += pse.employee.hourly_rate * pse.capacity_on_project * DAILY_HOUR_WORK * business_days
        return total_cost

class Skills(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
    employees = relationship("SkillsEmployees", back_populates="skill")
    project_skills_employees = relationship("ProjectSkillsEmployees", back_populates="skill")

class Employees(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    base_capacity = Column(Float, default=1.0)
    hourly_rate = Column(Float)
    skills = relationship("SkillsEmployees", back_populates="employee")
    project_skills_employees = relationship("ProjectSkillsEmployees", back_populates="employee")

    def get_capacity_for_period(self, start_date: datetime, end_date: datetime, db: Session):
        """
        Calculate capacity metrics for a given time period.
        
        Analyzes capacity usage day by day, considering only business days.
        capacity_on_project represents daily capacity needed during assignment.
        
        Returns:
        - allocated_capacity: MAXIMUM capacity used by ongoing projects on any business day
        - planned_capacity: MAXIMUM capacity used by planned projects on any business day  
        - available_capacity: MINIMUM available capacity on business days during the period
        """
        overlapping_assignments = db.query(ProjectSkillsEmployees).filter(
            ProjectSkillsEmployees.employee_id == self.id,
            ProjectSkillsEmployees.skill_end >= start_date,
            ProjectSkillsEmployees.skill_start <= end_date
        ).all()
        
        if not overlapping_assignments:
            return {
                'allocated_capacity': 0.0,
                'planned_capacity': 0.0,
                'available_capacity': self.base_capacity
            }
        
        current_date = start_date
        min_available = self.base_capacity
        max_allocated = 0.0
        max_planned = 0.0
        
        while current_date <= end_date:
            if is_business_day(current_date):
                day_allocated = 0.0
                day_planned = 0.0
                
                for assignment in overlapping_assignments:
                    if assignment.skill_start <= current_date <= assignment.skill_end:
                        project_status = assignment.project.status
                        
                        if project_status == ProjectStatus.ONGOING:
                            day_allocated += assignment.capacity_on_project
                        elif project_status == ProjectStatus.PLANNED:
                            day_planned += assignment.capacity_on_project
                
                day_available = max(0.0, self.base_capacity - (day_allocated + day_planned))
                min_available = min(min_available, day_available)
                max_allocated = max(max_allocated, day_allocated)
                max_planned = max(max_planned, day_planned)
            
            current_date += timedelta(days=1)
        
        return {
            'allocated_capacity': max_allocated,
            'planned_capacity': max_planned,
            'available_capacity': min_available
        }

class SkillsEmployees(Base):
    __tablename__ = "skills_employees"

    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), primary_key=True)
    proficiency = Column(Integer)
    
    skill = relationship("Skills", back_populates="employees")
    employee = relationship("Employees", back_populates="skills")

class ProjectSkillsEmployees(Base):
    __tablename__ = "project_skills_employees"

    project_id = Column(Integer, ForeignKey("projects.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), primary_key=True)
    needed_proficiency = Column(Integer)
    capacity_on_project = Column(Float)
    skill_start = Column(DateTime)
    skill_end = Column(DateTime)
    
    project = relationship("Projects", back_populates="project_skills_employees")
    skill = relationship("Skills", back_populates="project_skills_employees")
    employee = relationship("Employees", back_populates="project_skills_employees")


# POST MODELS

class ProjectCreate(BaseModel):
    name: str
    short_name: str
    description: str
    start: datetime
    end: datetime
    status: ProjectStatus = ProjectStatus.PLANNED
    fix_cost: float
    revenue: float

    @field_validator('end')
    @classmethod
    def end_must_be_after_start(cls, v, info):
        if info.data.get('start') and v <= info.data['start']:
            raise ValueError('end must be after start')
        return v

class SkillCreate(BaseModel):
    name: str
    category: str

class EmployeeCreate(BaseModel):
    name: str
    base_capacity: float
    hourly_rate: float

class SkillEmployeeCreate(BaseModel):
    skill_id: int
    employee_id: int
    proficiency: int

class ProjectSkillEmployeeCreate(BaseModel):
    project_id: int
    skill_id: int
    employee_id: int
    needed_proficiency: int
    capacity_on_project: float
    skill_start: datetime
    skill_end: datetime

    @field_validator('skill_end')
    @classmethod
    def skill_end_must_be_after_start(cls, v, info):
        if info.data.get('skill_start') and v <= info.data['skill_start']:
            raise ValueError('skill_end must be after skill_start')
        return v


# UPDATE MODELS

class ProjectUpdate(BaseModel):
    name: str = None
    short_name: str = None
    description: str = None
    start: datetime = None
    end: datetime = None
    status: ProjectStatus = None
    fix_cost: float = None
    revenue: float = None

    @field_validator('end')
    @classmethod
    def end_must_be_after_start(cls, v, info):
        if v is not None and info.data.get('start') and v <= info.data['start']:
            raise ValueError('end must be after start')
        return v

class SkillUpdate(BaseModel):
    name: str = None
    category: str = None

class EmployeeUpdate(BaseModel):
    name: str = None
    base_capacity: float = None
    hourly_rate: float = None

class SkillEmployeeUpdate(BaseModel):
    proficiency: int = None

class ProjectSkillEmployeeUpdate(BaseModel):
    needed_proficiency: int = None
    capacity_on_project: float = None
    skill_start: datetime = None
    skill_end: datetime = None

    @field_validator('skill_end')
    @classmethod
    def skill_end_must_be_after_start(cls, v, info):
        if v is not None and info.data.get('skill_start') and v <= info.data['skill_start']:
            raise ValueError('skill_end must be after skill_start')
        return v

# RESPONSE MODELS

class ProjectResponse(BaseModel):
    id: int
    name: str
    short_name: str
    description: str
    start: datetime
    end: datetime
    status: ProjectStatus
    fix_cost: float
    revenue: float
    employee_cost: float

    class Config:
        from_attributes = True