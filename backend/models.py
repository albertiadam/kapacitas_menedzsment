from sqlalchemy import Column,Integer,String,Float,Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
from pydantic import BaseModel

# GET MODELS (db tables)

class Projects(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    short_name = Column(String)
    description = Column(String)
    start = Column(DateTime)
    end = Column(DateTime)
    fix_cost = Column(Float)
    employee_cost = Column(Float,default=0.0)
    revenue = Column(Float)
    project_skills_employees = relationship("ProjectSkillsEmployees", back_populates="project")

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
    description: str
    start: datetime
    end: datetime
    revenue: float

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
