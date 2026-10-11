from fastapi import APIRouter, Depends
from ..dependencies import get_current_user
from ..models import User
from ..schemas import ScreeningRequest

router = APIRouter()


@router.post("")
def screen(
    data: ScreeningRequest,
    user: User = Depends(get_current_user),
):
    # Prototype screening score for MVP demonstration.
    # This is NOT a clinical diagnostic model.
    factors = [
        data.tremor,
        data.slow_movement,
        data.balance_difficulty,
        data.speech_difficulty,
        data.memory_difficulty,
        data.sleep_problem,
    ]
    score = round((sum(factors) / len(factors)) * 100)

    if score >= 67:
        level = "High"
    elif score >= 34:
        level = "Moderate"
    else:
        level = "Low"

    return {
        "score": score,
        "risk_level": level,
        "message": (
            "This result is a screening-support indicator and not a diagnosis. "
            "Consult a qualified healthcare professional for medical evaluation."
        ),
    }
