from sqlalchemy import Column,Integer,String,Float,Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Projects(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    start = Column(DateTime)
    end = Column(DateTime)
    revenue = Column(Float)

