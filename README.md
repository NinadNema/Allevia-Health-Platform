# Allevia MVP

AI-assisted healthcare platform for neurological/neurodegenerative condition support.

## Current MVP
- JWT authentication
- Patient profile
- Medication management + adherence
- Lifestyle tracking
- AI-assisted screening endpoint (demo/rule-based risk scoring)
- Dashboard with summary data

## Stack
- Frontend: React + Vite
- Backend: Python FastAPI
- Database: SQLite for local development (easy to replace with PostgreSQL)
- Auth: JWT
- Charts/UI: basic React/CSS

## Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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
