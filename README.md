# Allevia MVP

AI-assisted healthcare platform for neurological/neurodegenerative condition support.

## Current MVP
- Patient registration/login and profile
- Medication management and adherence tracking
- Lifestyle logs and rehabilitation activities
- Progress summaries and rule-based health insights
- Neurological symptom screening prototype (not a medical diagnosis)

## Stack
- Frontend: React + Vite
- Backend: Python FastAPI
- Database: SQLite by default; PostgreSQL is configurable through `DATABASE_URL`
- Auth: JWT
- Charts/UI: basic React/CSS

## Run

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:ALLEVIA_SECRET_KEY = (& python -c "import secrets; print(secrets.token_urlsafe(32))")
uvicorn app.main:app --reload
```

SQLite is used by default for local development. To use PostgreSQL, set
`DATABASE_URL` to a SQLAlchemy URL such as
`postgresql+psycopg://user:password@localhost:5432/allevia` before starting the
API. Keep credentials and signing keys out of source control.

### Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend docs: http://127.0.0.1:8000/docs

> The screening feature is a prototype risk-support workflow, not a medical diagnosis.
