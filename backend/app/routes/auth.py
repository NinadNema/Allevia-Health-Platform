from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, PatientProfile
from ..schemas import RegisterRequest, LoginRequest, UserResponse
from ..security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="patient",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = PatientProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    return {
        "message": "Registration successful",
        "access_token": create_access_token(user.id),
        "user": UserResponse.model_validate(user),
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": create_access_token(user.id),
        "user": UserResponse.model_validate(user),
    }
