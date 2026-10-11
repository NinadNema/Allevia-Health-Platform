from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import auth, patients, medications, lifestyle, screening

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Allevia API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patient Profile"])
app.include_router(medications.router, prefix="/api/medications", tags=["Medication"])
app.include_router(lifestyle.router, prefix="/api/lifestyle", tags=["Lifestyle"])
app.include_router(screening.router, prefix="/api/screening", tags=["Disease Screening"])


@app.get("/")
def root():
    return {"message": "Allevia API is running"}
