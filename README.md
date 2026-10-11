# Allevia Health Platform

> A patient-facing web app that helps people living with neurological and neurodegenerative conditions track medications, daily habits and rehabilitation activities, and see their progress in one place.

> **Medical disclaimer:** Allevia is a prototype for informational and self-tracking purposes only. The screening feature and health insights are simple rule-based indicators. They are **not** a medical diagnosis and are not a substitute for advice from a qualified healthcare professional.

---

## Table of Contents

1. [What is Allevia?](#what-is-allevia)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Configuration](#configuration)
8. [API Reference](#api-reference)
9. [Data Model](#data-model)
10. [How the Rule-Based Logic Works](#how-the-rule-based-logic-works)
11. [Security Notes](#security-notes)
12. [Known Limitations and Roadmap](#known-limitations-and-roadmap)
13. [Team](#team)

---

## What is Allevia?

Managing a neurological condition means juggling many things at once: medicine schedules, sleep, exercise, symptoms and rehabilitation routines. Allevia brings these into a single dashboard so a patient can:

- keep an accurate record of what they take and do each day,
- see how consistent they have been over time,
- receive simple, readable feedback on their habits.

The project is currently an **MVP**: a working end-to-end foundation (auth, data, dashboards) with rule-based logic where more advanced AI features are planned later.

## Features

| Area | What it does |
| --- | --- |
| **Accounts** | Register and log in with email and password. Each user only ever sees their own data. |
| **Patient profile** | Store age, gender, medical history, allergies, current health status and symptoms. A blank profile is created automatically at registration. |
| **Medication management** | Add medications (name, dosage, frequency, time of day), mark doses as taken, and deactivate medications you no longer use. |
| **Lifestyle logs** | Log a date with sleep hours, activity minutes, mood and symptoms. |
| **Rehabilitation activities** | Create activities with a category, duration, difficulty and scheduled date, then mark them complete. |
| **Progress summary** | Aggregated view of activity completion, average sleep, total activity minutes and medication adherence. |
| **Health insights** | Plain-language positive and warning messages generated from your logged data. |
| **Symptom screening (prototype)** | Tick from six common symptoms and get a low, moderate or elevated indicator with a clear disclaimer. |

## Screenshots

Save your screenshots in `docs/screenshots/` using these file names. The `width` values keep them small on the page, so edit them to make the images larger or smaller.

<p align="center">
  <img src="./screenshots/dashboard.png" alt="Dashboard" width="700">
</p>

<table>
  <tr>
    <td align="center">
      <img src="./screenshots/medication.png" alt="Medication tracking" width="340"><br>
      <sub>Medication tracking</sub>
    </td>
    <td align="center">
      <img src="./screenshots/progress-insights.png" alt="Progress and insights" width="340"><br>
      <sub>Progress and insights</sub>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="./screenshots/screening.png" alt="Symptom screening prototype" width="340"><br>
      <sub>Symptom screening (prototype)</sub>
    </td>
  </tr>
</table>

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 6, plain CSS |
| Backend | Python, FastAPI, Uvicorn |
| ORM | SQLAlchemy |
| Database | SQLite by default, PostgreSQL via `DATABASE_URL` |
| Auth | JWT (HS256) using `python-jose`, passwords hashed with bcrypt (`passlib`) |
| Validation | Pydantic (including email validation) |

## Project Structure

```
Allevia-Health-Platform/
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # FastAPI app, CORS, router registration
│       ├── database.py        # Engine, session factory, DATABASE_URL handling
│       ├── models.py          # SQLAlchemy models
│       ├── schemas.py         # Pydantic request/response schemas
│       ├── security.py        # Password hashing and JWT creation/decoding
│       ├── dependencies.py    # get_current_user (bearer-token auth)
│       └── routes/
│           ├── auth.py        # Register and login
│           ├── patients.py    # Profile read/update
│           ├── medications.py # Medication CRUD-style actions
│           ├── lifestyle.py   # Daily lifestyle logs
│           ├── activities.py  # Rehabilitation activities
│           ├── progress.py    # Aggregated progress numbers
│           ├── insights.py    # Rule-based insight generation
│           └── screening.py   # Symptom screening prototype
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx            # Auth, layout, navigation, dashboard, profile, medication
        ├── styles.css
        └── components/
            ├── Lifestyle.jsx
            ├── Activities.jsx
            ├── Progress.jsx
            ├── Insights.jsx
            └── Screening.jsx
```

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer, with npm
- (Optional) A PostgreSQL server if you do not want to use SQLite

### 1. Clone the repository

```bash
git clone https://github.com/NinadNema/Allevia-Health-Platform.git
cd Allevia-Health-Platform
```

### 2. Start the backend

The API refuses to start unless `ALLEVIA_SECRET_KEY` is set (it is used to sign login tokens).

**macOS / Linux**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export ALLEVIA_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
uvicorn app.main:app --reload
```

**Windows (PowerShell)**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:ALLEVIA_SECRET_KEY = (& python -c "import secrets; print(secrets.token_urlsafe(32))")
uvicorn app.main:app --reload
```

The API runs at <http://127.0.0.1:8000>, with interactive docs at <http://127.0.0.1:8000/docs>.

> Tables are created automatically on startup, and a local `allevia.db` SQLite file is created in the directory you launch from. It is git-ignored.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>, create an account, and you are in.

### 4. Build for production (frontend)

```bash
npm run build     # outputs to frontend/dist
npm run preview   # serves the production build locally
```

## Configuration

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `ALLEVIA_SECRET_KEY` | **Yes** | none | Secret used to sign JWTs. Use a long random value and never commit it. |
| `DATABASE_URL` | No | `sqlite:///./allevia.db` | Any SQLAlchemy URL. |

**Using PostgreSQL**

```bash
export DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/allevia"
```

The `psycopg` driver is already included in `requirements.txt`.

**Other settings you may need to change**

- **Frontend API address:** `const API = "http://127.0.0.1:8000/api"` at the top of `frontend/src/App.jsx`.
- **Allowed CORS origins:** set in `backend/app/main.py` (currently `http://localhost:5173` and `http://127.0.0.1:5173`).
- **Token lifetime:** `ACCESS_TOKEN_EXPIRE_MINUTES` in `backend/app/security.py` (currently 24 hours).

## API Reference

All endpoints are prefixed with `/api`. Every endpoint except register and login requires the header:

```
Authorization: Bearer <access_token>
```

You can try all of these from the Swagger UI at `/docs`.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create an account. Returns an access token and the user. |
| POST | `/auth/login` | Log in. Returns an access token and the user. |

### Patient profile

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/patients/me` | Get the current user and their profile. |
| PUT | `/patients/me` | Update the profile. |

### Medications

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/medications` | List your medications (newest first). |
| POST | `/medications` | Add a medication (`name`, `dosage`, `frequency`, `time`). |
| PATCH | `/medications/{id}/taken` | Record a dose as taken. |
| PATCH | `/medications/{id}/deactivate` | Mark a medication as no longer active. |

### Lifestyle logs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/lifestyle` | List logs, most recent date first. |
| POST | `/lifestyle` | Add a log (`date`, optional `sleep_hours`, `activity_minutes`, `mood`, `symptoms`). |

### Rehabilitation activities

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/activities` | List activities ordered by scheduled date. |
| POST | `/activities` | Add an activity (`title`, `category`, plus optional `description`, `duration_minutes`, `difficulty`, `scheduled_date`). |
| PATCH | `/activities/{id}/complete` | Mark an activity as completed. |

### Progress, insights and screening

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/progress` | Activity completion, lifestyle averages and medication adherence. |
| GET | `/insights` | Rule-based insight messages plus a small data summary. |
| POST | `/screening` | Symptom screening. Body: `{"symptoms": ["tremor", "slow_movement"]}`. |

Valid screening symptoms: `tremor`, `slow_movement`, `balance_difficulty`, `speech_difficulty`, `memory_difficulty`, `sleep_problem`.

## Data Model

```
User ──1:1── PatientProfile
  │
  ├──1:N── Medication      (name, dosage, frequency, time, active, taken_count, missed_count)
  ├──1:N── LifestyleLog    (date, sleep_hours, activity_minutes, mood, symptoms)
  └──1:N── Activity        (title, description, category, duration_minutes, difficulty,
                            scheduled_date, completed, completed_at)
```

Every record is owned by a user, and every query filters by the logged-in user's id, so patients cannot read or change each other's data.

## How the Rule-Based Logic Works

There is no machine learning in the MVP. Everything below is deterministic and easy to inspect in `backend/app/routes/`.

**Insights** (`insights.py`)

| Signal | Positive message when | Warning when |
| --- | --- | --- |
| Activity completion rate | 80% or higher | below 50% |
| Average sleep | 7 hours or more | below 6 hours |
| Total logged activity minutes | 150 or more | below 150 |
| Medication adherence (taken ÷ taken + missed) | 90% or higher | below 70% |

If there is no data yet, a friendly "start tracking" message is returned.

**Screening** (`screening.py`)

The score is simply the share of the six listed symptoms the user selected:

| Score | Indicator |
| --- | --- |
| 0 – 33 | Low |
| 34 – 66 | Moderate |
| 67 – 100 | Elevated |

This is a count of selected symptoms, **not** the probability of having a disease.

## Security Notes

- Passwords are hashed with bcrypt and never stored in plain text.
- API access uses signed JWT bearer tokens that expire after 24 hours.
- The signing key comes from the environment and the server will not start without it.
- `.env` files and local database files are git-ignored. Keep credentials and keys out of source control.
- CORS is restricted to the local Vite dev origins. Update it before deploying anywhere else.
- The frontend currently stores the token in `localStorage`. Consider httpOnly cookies for a production deployment.

## Known Limitations and Roadmap

Being upfront about where the MVP stands:

- **Missed doses are not recorded yet.** The data model and the progress/insight calculations support `missed_count`, but there is currently no endpoint or UI action that increments it, so adherence will read as 100% once any dose is taken. Adding a "missed" action or automatic detection from the schedule is the natural next step.
- **No tests or CI yet.** Adding pytest for the API and a GitHub Actions workflow would be valuable.
- **No database migrations.** Tables are created with `create_all`; Alembic should be introduced before the schema changes.
- **Single role.** Everyone is a `patient`; the `role` field is in place for future caregiver or clinician access.
- **Screening and insights are rule-based.** Replacing or augmenting them with validated clinical tools and ML models is the long-term goal.

Ideas for future work: medication reminders and notifications, charts and trend graphs, caregiver and clinician views, data export, and a hosted deployment.

## Team

This project was built as a group project by:

| Name | Registration No.
| --- | --- |
| NINAD NEMAWARKAR | 23BCE10350 |
| TIWARI SAMARTH | 23BCE11556 |
| SAURAV KUMAR PANDEY | 23BCE11571 |
| PRERANA TALUKDAR | 23BCE11395 |
| SHIVANSH SHARMA | 23BCE11158 |

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss what you would like to change.

## License

No license has been specified yet. Add a `LICENSE` file to make the terms of use explicit.