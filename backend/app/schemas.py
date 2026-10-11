from datetime import date
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)


class ProfileRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_health_status: Optional[str] = None
    symptoms: Optional[str] = None


class MedicationRequest(BaseModel):
    name: str
    dosage: str
    frequency: str
    time: str


class MedicationResponse(MedicationRequest):
    id: int
    active: bool
    taken_count: int
    missed_count: int
    model_config = ConfigDict(from_attributes=True)


class LifestyleRequest(BaseModel):
    date: date
    sleep_hours: Optional[float] = None
    activity_minutes: Optional[int] = None
    mood: Optional[str] = None
    symptoms: Optional[str] = None


class ScreeningRequest(BaseModel):
    tremor: bool = False
    slow_movement: bool = False
    balance_difficulty: bool = False
    speech_difficulty: bool = False
    memory_difficulty: bool = False
    sleep_problem: bool = False
