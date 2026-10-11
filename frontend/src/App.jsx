import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [activePage, setActivePage] = useState("dashboard");

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    medical_history: "",
    allergies: "",
    current_health_status: "",
    symptoms: "",
  });

  const [user, setUser] = useState(null);
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // =========================
  // AUTHENTICATION
  // =========================

  const submitAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/auth/login" : "/auth/register";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : form;

      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Something went wrong");
        return;
      }

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD USER PROFILE
  // =========================

  const loadProfile = async () => {
    if (!token) return;

    try {
      setProfileLoading(true);

      const res = await fetch(`${API}/patients/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
        }
        return;
      }

      const data = await res.json();

      setUser(data.user);

      if (data.profile) {
        setProfile({
          age: data.profile.age ?? "",
          gender: data.profile.gender ?? "",
          medical_history: data.profile.medical_history ?? "",
          allergies: data.profile.allergies ?? "",
          current_health_status:
            data.profile.current_health_status ?? "",
          symptoms: data.profile.symptoms ?? "",
        });
      }
    } catch (error) {
      console.error("Profile loading error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  // =========================
  // UPDATE PROFILE
  // =========================

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      setProfileSaved(false);

      const res = await fetch(`${API}/patients/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profile,
          age: profile.age === "" ? null : Number(profile.age),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Unable to save profile");
        return;
      }

      setProfileSaved(true);

      setTimeout(() => {
        setProfileSaved(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the backend.");
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================
  // SCREENING
  // =========================

  const runScreening = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/screening`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tremor: true,
          slow_movement: true,
          balance_difficulty: false,
          speech_difficulty: false,
          memory_difficulty: false,
          sleep_problem: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Screening failed");
        return;
      }

      setScreening(data);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setActivePage("dashboard");
  };

  // =========================
  // AUTH SCREEN
  // =========================

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand">ALLEVIA</div>

          <p className="tagline">
            Your health. One connected platform.
          </p>

          <h1>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <form onSubmit={submitAuth}>
            {mode === "register" && (
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />

            <button disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </button>
          </form>

          <button
            className="link-button"
            onClick={() =>
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            {mode === "login"
              ? "Create an account"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside>
        <div className="brand">ALLEVIA</div>

        <button
          className={`side-item ${
            activePage === "dashboard" ? "active" : ""
          }`}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`side-item ${
            activePage === "profile" ? "active" : ""
          }`}
          onClick={() => setActivePage("profile")}
        >
          Health Profile
        </button>

        <button
          className={`side-item ${
            activePage === "screening" ? "active" : ""
          }`}
          onClick={() => setActivePage("screening")}
        >
          AI Screening
        </button>

        <button
          className="side-item"
          onClick={() => alert("Medication module coming next")}
        >
          Medication
        </button>

        <button
          className="side-item"
          onClick={() => alert("Lifestyle module coming next")}
        >
          Lifestyle
        </button>

        <button
          className="side-item"
          onClick={() => alert("Activities module coming later")}
        >
          Activities
        </button>

        <button
          className="side-item"
          onClick={() => alert("Progress module coming later")}
        >
          Progress
        </button>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}

      <main>

        {/* ================= DASHBOARD ================= */}

        {activePage === "dashboard" && (
          <>
            <header>
              <div>
                <span className="eyebrow">
                  PATIENT DASHBOARD
                </span>

                <h1>
                  Good to see you
                  {user?.name
                    ? `, ${user.name.split(" ")[0]}`
                    : ""}
                  .
                </h1>
              </div>

              <div className="avatar">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "P"}
              </div>
            </header>

            <section className="cards">

              <div className="card">
                <span>Sleep</span>
                <strong>7.2h</strong>
                <small>Last recorded</small>
              </div>

              <div className="card">
                <span>Activity</span>
                <strong>35 min</strong>
                <small>Today's activity</small>
              </div>

              <div className="card">
                <span>Medication</span>
                <strong>87%</strong>
                <small>Adherence</small>
              </div>

              <div className="card">
                <span>Symptoms</span>
                <strong>
                  {profile.symptoms
                    ? profile.symptoms
                        .split(",")
                        .filter(Boolean).length
                    : 0}
                </strong>
                <small>Tracked</small>
              </div>

            </section>

            <section className="grid">

              <div className="panel">

                <div className="panel-heading">

                  <div>
                    <span className="eyebrow">
                      AI-ASSISTED
                    </span>

                    <h2>Disease Screening</h2>
                  </div>

                  <span className="pill">
                    Prototype
                  </span>

                </div>

                <p>
                  Run a screening-support assessment
                  based on selected symptoms.
                </p>

                <button onClick={runScreening}>
                  {loading
                    ? "Analyzing..."
                    : "Run Screening"}
                </button>

                {screening && (
                  <div className="result">

                    <div>
                      <small>RISK SCORE</small>
                      <strong>
                        {screening.score}%
                      </strong>
                    </div>

                    <div>
                      <small>RISK LEVEL</small>
                      <strong>
                        {screening.risk_level}
                      </strong>
                    </div>

                  </div>
                )}

              </div>

              <div className="panel">

                <span className="eyebrow">
                  PROFILE
                </span>

                <h2>Health Profile</h2>

                <div className="profile-summary">

                  <div>
                    <span>Name</span>
                    <strong>
                      {user?.name || "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>Age</span>
                    <strong>
                      {profile.age || "Not added"}
                    </strong>
                  </div>

                  <div>
                    <span>Gender</span>
                    <strong>
                      {profile.gender || "Not added"}
                    </strong>
                  </div>

                  <button
                    onClick={() =>
                      setActivePage("profile")
                    }
                  >
                    View Profile
                  </button>

                </div>

              </div>

            </section>

            <section className="panel">

              <span className="eyebrow">
                HEALTH OVERVIEW
              </span>

              <h2>Weekly Activity</h2>

              <div className="bars">

                {[45, 65, 40, 80, 58, 72, 50].map(
                  (height, index) => (
                    <div
                      className="bar-wrap"
                      key={index}
                    >
                      <div
                        className="bar"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <small>
                        {
                          ["M", "T", "W", "T", "F", "S", "S"][
                            index
                          ]
                        }
                      </small>
                    </div>
                  )
                )}

              </div>

            </section>
          </>
        )}

        {/* ================= PROFILE ================= */}

        {activePage === "profile" && (
          <>
            <header>

              <div>
                <span className="eyebrow">
                  HEALTH PROFILE
                </span>

                <h1>My Health Profile</h1>

                <p className="page-description">
                  Keep your health information updated
                  so Allevia can provide better
                  screening and monitoring.
                </p>
              </div>

              <div className="avatar">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "P"}
              </div>

            </header>

            <form
              className="profile-form"
              onSubmit={saveProfile}
            >

              {/* PERSONAL INFORMATION */}

              <section className="panel">

                <div className="section-title">
                  <span className="section-number">
                    01
                  </span>

                  <div>
                    <span className="eyebrow">
                      PERSONAL
                    </span>

                    <h2>Personal Information</h2>
                  </div>
                </div>

                <div className="profile-grid">

                  <div className="field">

                    <label>Full Name</label>

                    <input
                      value={user?.name || ""}
                      disabled
                    />

                    <small>
                      Name is linked to your account.
                    </small>

                  </div>

                  <div className="field">

                    <label>Email</label>

                    <input
                      value={user?.email || ""}
                      disabled
                    />

                    <small>
                      Email is linked to your account.
                    </small>

                  </div>

                  <div className="field">

                    <label>Age</label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Enter your age"
                      value={profile.age}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          age: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="field">

                    <label>Gender</label>

                    <select
                      value={profile.gender}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>

                  </div>

                </div>

              </section>

              {/* MEDICAL INFORMATION */}

              <section className="panel">

                <div className="section-title">

                  <span className="section-number">
                    02
                  </span>

                  <div>
                    <span className="eyebrow">
                      MEDICAL
                    </span>

                    <h2>Medical Information</h2>
                  </div>

                </div>

                <div className="profile-grid">

                  <div className="field full">

                    <label>
                      Medical History
                    </label>

                    <textarea
                      placeholder="Describe any previous medical conditions, surgeries, or important medical history..."
                      value={profile.medical_history}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          medical_history:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="field full">

                    <label>Allergies</label>

                    <textarea
                      placeholder="List any known allergies..."
                      value={profile.allergies}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          allergies: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="field full">

                    <label>
                      Current Health Status
                    </label>

                    <textarea
                      placeholder="Describe your current health condition..."
                      value={
                        profile.current_health_status
                      }
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          current_health_status:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="field full">

                    <label>
                      Current Symptoms
                    </label>

                    <textarea
                      placeholder="Example: tremor, fatigue, balance difficulty..."
                      value={profile.symptoms}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          symptoms: e.target.value,
                        })
                      }
                    />

                    <small>
                      Separate multiple symptoms
                      with commas.
                    </small>

                  </div>

                </div>

              </section>

              {/* SAVE */}

              <div className="save-row">

                {profileSaved && (
                  <div className="success-message">
                    ✓ Health profile saved successfully
                  </div>
                )}

                <button
                  className="save-button"
                  type="submit"
                  disabled={profileLoading}
                >
                  {profileLoading
                    ? "Saving..."
                    : "Save Health Profile"}
                </button>

              </div>

            </form>
          </>
        )}

        {/* ================= SCREENING ================= */}

        {activePage === "screening" && (
          <>
            <header>

              <div>
                <span className="eyebrow">
                  AI-ASSISTED
                </span>

                <h1>Disease Screening</h1>

                <p className="page-description">
                  Complete a symptom-based screening
                  assessment.
                </p>
              </div>

              <span className="pill">
                Prototype
              </span>

            </header>

            <section className="panel screening-panel">

              <h2>Screening Assessment</h2>

              <p>
                This prototype evaluates selected
                symptoms to generate a screening-support
                risk level.
              </p>

              <div className="screening-items">

                <label>
                  <input type="checkbox" defaultChecked />
                  Tremor
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Slow movement
                </label>

                <label>
                  <input type="checkbox" />
                  Balance difficulty
                </label>

                <label>
                  <input type="checkbox" />
                  Speech difficulty
                </label>

                <label>
                  <input type="checkbox" />
                  Memory difficulty
                </label>

                <label>
                  <input type="checkbox" defaultChecked />
                  Sleep problem
                </label>

              </div>

              <button onClick={runScreening}>
                {loading
                  ? "Analyzing..."
                  : "Run Screening"}
              </button>

              {screening && (
                <div className="screening-result">

                  <span className="eyebrow">
                    SCREENING RESULT
                  </span>

                  <div className="screening-score">
                    {screening.score}%
                  </div>

                  <div className="risk-level">
                    {screening.risk_level}
                  </div>

                  <p>
                    {screening.message}
                  </p>

                </div>
              )}

            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default App;