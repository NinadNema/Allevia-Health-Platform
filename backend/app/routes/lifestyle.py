from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import LifestyleLog, User
from ..schemas import LifestyleRequest

router = APIRouter()


@router.get("")
def list_logs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(LifestyleLog).filter(
        LifestyleLog.user_id == user.id
    ).order_by(LifestyleLog.date.desc()).all()


@router.post("")
def add_log(
    data: LifestyleRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = LifestyleLog(user_id=user.id, **data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
