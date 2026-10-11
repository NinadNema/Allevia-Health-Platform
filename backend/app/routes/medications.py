from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Medication, User
from ..schemas import MedicationRequest, MedicationResponse


router = APIRouter()


# Get all medications for the logged-in patient
@router.get("", response_model=list[MedicationResponse])
def list_medications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medications = (
        db.query(Medication)
        .filter(Medication.user_id == user.id)
        .order_by(Medication.id.desc())
        .all()
    )

    return medications


# Add a new medication
@router.post("", response_model=MedicationResponse)
def add_medication(
    data: MedicationRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = Medication(
        user_id=user.id,
        name=data.name,
        dosage=data.dosage,
        frequency=data.frequency,
        time=data.time,
        active=True,
        taken_count=0,
        missed_count=0,
    )

    db.add(medication)
    db.commit()
    db.refresh(medication)

    return medication


# Mark medication as taken
@router.patch("/{medication_id}/taken")
def mark_medication_taken(
    medication_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.user_id == user.id,
        )
        .first()
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medication not found",
        )

    medication.taken_count += 1

    db.commit()
    db.refresh(medication)

    return {
        "message": "Medication marked as taken",
        "medication_id": medication.id,
        "taken_count": medication.taken_count,
    }


# Deactivate a medication
@router.patch("/{medication_id}/deactivate")
def deactivate_medication(
    medication_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id,
            Medication.user_id == user.id,
        )
        .first()
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medication not found",
        )

    medication.active = False

    db.commit()
    db.refresh(medication)

    return {
        "message": "Medication deactivated",
        "medication_id": medication.id,
    }