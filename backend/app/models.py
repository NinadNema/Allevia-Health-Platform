from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="patient")

    profile = relationship("PatientProfile", back_populates="user", uselist=False)
    medications = relationship("Medication", back_populates="user")
    lifestyle_logs = relationship("LifestyleLog", back_populates="user")


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    current_health_status = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    time = Column(String(20), nullable=False)
    active = Column(Boolean, default=True)
    taken_count = Column(Integer, default=0)
    missed_count = Column(Integer, default=0)

    user = relationship("User", back_populates="medications")


class LifestyleLog(Base):
    __tablename__ = "lifestyle_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    sleep_hours = Column(Float, nullable=True)
    activity_minutes = Column(Integer, nullable=True)
    mood = Column(String(50), nullable=True)
    symptoms = Column(Text, nullable=True)

    user = relationship("User", back_populates="lifestyle_logs")
