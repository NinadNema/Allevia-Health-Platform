from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Medication, User
from ..schemas import MedicationRequest, MedicationResponse

router = APIRouter()


@router.get("", response_model=list[MedicationResponse])
def list_medications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Medication).filter(Medication.user_id == user.id).all()


@router.post("", response_model=MedicationResponse)
def add_medication(
    data: MedicationRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = Medication(user_id=user.id, **data.model_dump())
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication


@router.patch("/{medication_id}/taken")
def mark_taken(
    medication_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.user_id == user.id,
    ).first()
    if not medication:
        return {"error": "Medication not found"}

    medication.taken_count += 1
    db.commit()
    return {"message": "Marked as taken", "taken_count": medication.taken_count}
