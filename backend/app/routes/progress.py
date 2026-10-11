from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Activity, LifestyleLog, Medication


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)


@router.get("")
def get_progress(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .all()
    )

    lifestyle_logs = (
        db.query(LifestyleLog)
        .filter(LifestyleLog.user_id == current_user.id)
        .all()
    )

    medications = (
        db.query(Medication)
        .filter(Medication.user_id == current_user.id)
        .all()
    )

    total_activities = len(activities)
    completed_activities = sum(
        1 for activity in activities
        if activity.completed
    )

    pending_activities = (
        total_activities - completed_activities
    )

    activity_completion = (
        round(
            (completed_activities / total_activities) * 100,
            1
        )
        if total_activities > 0
        else 0
    )

    sleep_values = [
        log.sleep_hours
        for log in lifestyle_logs
        if log.sleep_hours is not None
    ]

    activity_minutes = [
        log.activity_minutes
        for log in lifestyle_logs
        if log.activity_minutes is not None
    ]

    average_sleep = (
        round(sum(sleep_values) / len(sleep_values), 1)
        if sleep_values
        else 0
    )

    total_activity_minutes = sum(activity_minutes)

    total_taken = sum(
        medication.taken_count or 0
        for medication in medications
    )

    total_missed = sum(
        medication.missed_count or 0
        for medication in medications
    )

    medication_total = total_taken + total_missed

    medication_adherence = (
        round(
            (total_taken / medication_total) * 100,
            1
        )
        if medication_total > 0
        else 0
    )

    return {
        "activities": {
            "total": total_activities,
            "completed": completed_activities,
            "pending": pending_activities,
            "completion_percentage": activity_completion,
        },
        "lifestyle": {
            "average_sleep_hours": average_sleep,
            "total_activity_minutes": total_activity_minutes,
            "logs": len(lifestyle_logs),
        },
        "medication": {
            "total_taken": total_taken,
            "total_missed": total_missed,
            "adherence_percentage": medication_adherence,
        },
    }