from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Activity, LifestyleLog, Medication

router = APIRouter(
    prefix="/api/insights",
    tags=["Health Insights"]
)


@router.get("")
def get_health_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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

    insights = []

    # -------------------------
    # Activity insights
    # -------------------------

    total_activities = len(activities)
    completed_activities = sum(
        1 for activity in activities
        if activity.completed
    )

    if total_activities > 0:
        completion_rate = (
            completed_activities / total_activities
        ) * 100

        if completion_rate >= 80:
            insights.append({
                "type": "positive",
                "category": "Activity",
                "title": "Great activity progress",
                "message": (
                    "You are completing most of your assigned "
                    "activities. Keep maintaining this consistency."
                )
            })
        elif completion_rate < 50:
            insights.append({
                "type": "warning",
                "category": "Activity",
                "title": "Activity completion is low",
                "message": (
                    "Try completing more of your scheduled activities "
                    "to maintain a consistent routine."
                )
            })

    # -------------------------
    # Lifestyle insights
    # -------------------------

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

    if sleep_values:
        average_sleep = sum(sleep_values) / len(sleep_values)

        if average_sleep < 6:
            insights.append({
                "type": "warning",
                "category": "Sleep",
                "title": "Low average sleep",
                "message": (
                    f"Your recorded average sleep is "
                    f"{round(average_sleep, 1)} hours. "
                    "Consider improving your sleep routine."
                )
            })
        elif average_sleep >= 7:
            insights.append({
                "type": "positive",
                "category": "Sleep",
                "title": "Healthy sleep pattern",
                "message": (
                    f"Your average recorded sleep is "
                    f"{round(average_sleep, 1)} hours."
                )
            })

    if activity_minutes:
        total_minutes = sum(activity_minutes)

        if total_minutes < 150:
            insights.append({
                "type": "warning",
                "category": "Lifestyle",
                "title": "Increase physical activity",
                "message": (
                    "Your recorded activity level is relatively low. "
                    "Try gradually increasing your daily activity."
                )
            })
        else:
            insights.append({
                "type": "positive",
                "category": "Lifestyle",
                "title": "Good activity level",
                "message": (
                    "Your recorded physical activity shows "
                    "a positive routine."
                )
            })

    # -------------------------
    # Medication insights
    # -------------------------

    total_taken = sum(
        medication.taken_count or 0
        for medication in medications
    )

    total_missed = sum(
        medication.missed_count or 0
        for medication in medications
    )

    medication_total = total_taken + total_missed

    if medication_total > 0:
        adherence = (
            total_taken / medication_total
        ) * 100

        if adherence >= 90:
            insights.append({
                "type": "positive",
                "category": "Medication",
                "title": "Excellent medication adherence",
                "message": (
                    f"Your recorded medication adherence is "
                    f"{round(adherence, 1)}%."
                )
            })
        elif adherence < 70:
            insights.append({
                "type": "warning",
                "category": "Medication",
                "title": "Medication adherence needs attention",
                "message": (
                    f"Your recorded medication adherence is "
                    f"{round(adherence, 1)}%. "
                    "Try to follow your prescribed schedule consistently."
                )
            })

    # -------------------------
    # Default insight
    # -------------------------

    if not insights:
        insights.append({
            "type": "info",
            "category": "General",
            "title": "Start tracking your health",
            "message": (
                "Add lifestyle logs, activities, and medications "
                "to receive personalized health insights."
            )
        })

    return {
        "insights": insights,
        "summary": {
            "activities": total_activities,
            "completed_activities": completed_activities,
            "lifestyle_logs": len(lifestyle_logs),
            "medications": len(medications),
        }
    }