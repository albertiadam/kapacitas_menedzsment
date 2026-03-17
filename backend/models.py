from sqlalchemy import Column,Integer,String,Float,Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
from pydantic import BaseModel

class Projects(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    start = Column(DateTime)
    end = Column(DateTime)
    revenue = Column(Float)

class ProjectCreate(BaseModel):
    name: str
    description: str
    start: datetime
    end: datetime
    revenue: float

