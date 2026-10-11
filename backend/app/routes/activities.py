from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Activity
from ..schemas import ActivityRequest, ActivityResponse


router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"]
)


@router.get("", response_model=list[ActivityResponse])
def list_activities(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.scheduled_date.asc(), Activity.id.desc())
        .all()
    )


@router.post("", response_model=ActivityResponse)
def add_activity(
    data: ActivityRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    activity = Activity(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        category=data.category,
        duration_minutes=data.duration_minutes,
        difficulty=data.difficulty,
        scheduled_date=data.scheduled_date,
        completed=False,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.patch(
    "/{activity_id}/complete",
    response_model=ActivityResponse,
)
def complete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    activity = (
        db.query(Activity)
        .filter(
            Activity.id == activity_id,
            Activity.user_id == current_user.id,
        )
        .first()
    )

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found",
        )

    if activity.completed:
        return activity

    activity.completed = True
    activity.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(activity)

    return activity