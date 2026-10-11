from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..dependencies import get_current_user

router = APIRouter()


SCREENING_SYMPTOMS = (
    "tremor",
    "slow_movement",
    "balance_difficulty",
    "speech_difficulty",
    "memory_difficulty",
    "sleep_problem",
)

ScreeningSymptom = Literal[
    "tremor",
    "slow_movement",
    "balance_difficulty",
    "speech_difficulty",
    "memory_difficulty",
    "sleep_problem",
]


class ScreeningRequest(BaseModel):
    symptoms: list[ScreeningSymptom] = Field(min_length=1)


@router.post("")
def screen_disease(
    data: ScreeningRequest,
    current_user=Depends(get_current_user),
):
    score = round(len(set(data.symptoms)) / len(SCREENING_SYMPTOMS) * 100)

    if score >= 67:
        level = "Elevated"
    elif score >= 34:
        level = "Moderate"
    else:
        level = "Low"

    return {
        "symptoms_checked": data.symptoms,
        "score": score,
        "risk_level": level,
        "message": (
            f"The prototype screening indicator is {level.lower()} based "
            "on the symptoms selected."
        ),
        "disclaimer": (
            "This rule-based prototype is for informational purposes only. "
            "The percentage reflects the number of selected symptoms, not "
            "the probability of having a disease. "
            "It is not a medical diagnosis. "
            "Please consult a qualified healthcare professional about "
            "concerning symptoms."
        ),
    }