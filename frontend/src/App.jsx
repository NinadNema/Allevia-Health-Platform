import { useEffect, useState } from "react";
import Lifestyle from "./components/Lifestyle";
import Activities from "./components/Activities";
import Progress from "./components/Progress";
import Screening from "./components/Screening";
import Insights from "./components/Insights";

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
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // =========================
  // MEDICATION
  // =========================

  const [medications, setMedications] = useState([]);
  const [medicationLoading, setMedicationLoading] = useState(false);
  const [medicationSaving, setMedicationSaving] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    time: "08:00",
  });

  // =========================
  // AUTHENTICATION
  // =========================

  const submitAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

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
          current_health_status: data.profile.current_health_status ?? "",
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
  // MEDICATION API
  // =========================

  const loadMedications = async () => {
    if (!token) return;

    try {
      setMedicationLoading(true);

      const res = await fetch(`${API}/medications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) logout();
        return;
      }

      const data = await res.json();
      setMedications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Medication loading error:", error);
    } finally {
      setMedicationLoading(false);
    }
  };

  const addMedication = async (e) => {
    e.preventDefault();

    if (!medicationForm.name.trim() || !medicationForm.dosage.trim()) {
      alert("Please enter the medicine name and dosage.");
      return;
    }

    try {
      setMedicationSaving(true);

      const res = await fetch(`${API}/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(medicationForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Unable to add medication");
        return;
      }

      setMedications((current) => [data, ...current]);
      setMedicationForm({
        name: "",
        dosage: "",
        frequency: "Once daily",
        time: "08:00",
      });
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the backend.");
    } finally {
      setMedicationSaving(false);
    }
  };

  const markMedicationTaken = async (medicationId) => {
    try {
      const res = await fetch(`${API}/medications/${medicationId}/taken`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || data.error || "Unable to update medication");
        return;
      }

      setMedications((current) =>
        current.map((medication) =>
          medication.id === medicationId
            ? {
                ...medication,
                taken_count: data.taken_count,
              }
            : medication,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the backend.");
    }
  };

  const deactivateMedication = async (medicationId) => {
    try {
      const res = await fetch(`${API}/medications/${medicationId}/deactivate`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || data.error || "Unable to deactivate medication");
        return;
      }

      setMedications((current) =>
        current.map((medication) =>
          medication.id === medicationId
            ? { ...medication, active: false }
            : medication,
        ),
      );
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the backend.");
    }
  };

  const medicationAdherence = medications.length
    ? Math.round(
        (medications.reduce(
          (sum, medication) => sum + (medication.taken_count || 0),
          0,
        ) /
          Math.max(
            1,
            medications.reduce(
              (sum, medication) =>
                sum +
                (medication.taken_count || 0) +
                (medication.missed_count || 0),
              0,
            ),
          )) *
          100,
      )
    : 0;

  useEffect(() => {
    if (token) {
      loadMedications();
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

          <p className="tagline">Your health. One connected platform.</p>

          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>

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
            onClick={() => setMode(mode === "login" ? "register" : "login")}
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
          className={`side-item ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`side-item ${activePage === "profile" ? "active" : ""}`}
          onClick={() => setActivePage("profile")}
        >
          Health Profile
        </button>

        <button
          className={`side-item ${activePage === "screening" ? "active" : ""}`}
          onClick={() => setActivePage("screening")}
        >
          AI Screening
        </button>

        <button
          className={`side-item ${activePage === "medication" ? "active" : ""}`}
          onClick={() => setActivePage("medication")}
        >
          Medication
        </button>

        <button
          className={`side-item ${activePage === "lifestyle" ? "active" : ""}`}
          onClick={() => setActivePage("lifestyle")}
        >
          Lifestyle
        </button>

        <button
          className={`side-item ${activePage === "activities" ? "active" : ""}`}
          onClick={() => setActivePage("activities")}
        >
          Activities
        </button>

        <button
          className={`side-item ${activePage === "progress" ? "active" : ""}`}
          onClick={() => setActivePage("progress")}
        >
          Progress
        </button>

        <button
          className={`side-item ${activePage === "insights" ? "active" : ""}`}
          onClick={() => setActivePage("insights")}
        >
          Health Insights
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
                <span className="eyebrow">PATIENT DASHBOARD</span>

                <h1>
                  Good to see you
                  {user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
                </h1>
              </div>

              <div className="avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
              </div>
            </header>

            <section className="cards">
              <div className="card">
                <span>Sleep</span>
                <strong>--</strong>
                <small>View your logged data in Lifestyle</small>
              </div>

              <div className="card">
                <span>Activity</span>
                <strong>--</strong>
                <small>View your logged data in Lifestyle</small>
              </div>

              <div className="card">
                <span>Medication</span>
                <strong>{medicationAdherence}%</strong>
                <small>Adherence</small>
              </div>

              <div className="card">
                <span>Symptoms</span>
                <strong>
                  {profile.symptoms
                    ? profile.symptoms.split(",").filter(Boolean).length
                    : 0}
                </strong>
                <small>Tracked</small>
              </div>
            </section>

            <section className="grid">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">SCREENING PROTOTYPE</span>

                    <h2>Disease Screening</h2>
                  </div>

                  <span className="pill">Prototype</span>
                </div>

                <p>
                  Run a screening-support assessment based on selected symptoms.
                </p>

                <button onClick={() => setActivePage("screening")}>
                  Start Screening
                </button>
              </div>

              <div className="panel">
                <span className="eyebrow">PROFILE</span>

                <h2>Health Profile</h2>

                <div className="profile-summary">
                  <div>
                    <span>Name</span>
                    <strong>{user?.name || "Not available"}</strong>
                  </div>

                  <div>
                    <span>Age</span>
                    <strong>{profile.age || "Not added"}</strong>
                  </div>

                  <div>
                    <span>Gender</span>
                    <strong>{profile.gender || "Not added"}</strong>
                  </div>

                  <button onClick={() => setActivePage("profile")}>
                    View Profile
                  </button>
                </div>
              </div>
            </section>

            <section className="panel">
              <span className="eyebrow">HEALTH OVERVIEW</span>
              <h2>Progress</h2>
              <p>
                Record your activities and lifestyle information to track your
                progress over time.
              </p>
              <button onClick={() => setActivePage("progress")}>
                View Progress
              </button>
            </section>
          </>
        )}

        {/* ================= MEDICATION ================= */}

        {activePage === "medication" && (
          <>
            <header>
              <div>
                <span className="eyebrow">MEDICATION</span>
                <h1>Medication Management</h1>
                <p className="page-description">
                  Keep your medicines organized and track your daily adherence.
                </p>
              </div>

              <div className="avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
              </div>
            </header>

            <section className="cards">
              <div className="card">
                <span>Active medicines</span>
                <strong>
                  {medications.filter((medication) => medication.active).length}
                </strong>
                <small>Currently scheduled</small>
              </div>

              <div className="card">
                <span>Adherence</span>
                <strong>{medicationAdherence}%</strong>
                <small>Based on recorded doses</small>
              </div>

              <div className="card">
                <span>Doses taken</span>
                <strong>
                  {medications.reduce(
                    (sum, medication) => sum + (medication.taken_count || 0),
                    0,
                  )}
                </strong>
                <small>Total recorded</small>
              </div>
            </section>

            <section className="grid">
              <form className="panel" onSubmit={addMedication}>
                <span className="eyebrow">NEW MEDICATION</span>
                <h2>Add Medicine</h2>
                <p>Add a medicine to your personal schedule.</p>

                <div className="profile-grid">
                  <div className="field">
                    <label>Medicine name</label>
                    <input
                      placeholder="e.g. Paracetamol"
                      value={medicationForm.name}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Dosage</label>
                    <input
                      placeholder="e.g. 500 mg"
                      value={medicationForm.dosage}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          dosage: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Frequency</label>
                    <select
                      value={medicationForm.frequency}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          frequency: e.target.value,
                        })
                      }
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Weekly</option>
                      <option>As needed</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Scheduled time</label>
                    <input
                      type="time"
                      value={medicationForm.time}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          time: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="save-row">
                  <button type="submit" disabled={medicationSaving}>
                    {medicationSaving ? "Adding..." : "Add Medication"}
                  </button>
                </div>
              </form>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">TODAY</span>
                    <h2>Medication Schedule</h2>
                  </div>
                  <span className="pill">{medications.length} total</span>
                </div>

                {medicationLoading ? (
                  <p>Loading medications...</p>
                ) : medications.length === 0 ? (
                  <div className="result">
                    <div>
                      <strong>No medications yet</strong>
                      <small>Add your first medicine using the form.</small>
                    </div>
                  </div>
                ) : (
                  <div>
                    {medications.map((medication) => (
                      <div
                        key={medication.id}
                        className="result"
                        style={{ marginBottom: "12px" }}
                      >
                        <div style={{ flex: 1 }}>
                          <small>{medication.frequency}</small>
                          <strong>{medication.name}</strong>
                          <small>
                            {medication.dosage} · {medication.time}
                          </small>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {medication.active ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  markMedicationTaken(medication.id)
                                }
                              >
                                Mark Taken
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  deactivateMedication(medication.id)
                                }
                              >
                                Stop
                              </button>
                            </>
                          ) : (
                            <span className="pill">Inactive</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activePage === "lifestyle" && <Lifestyle token={token} />}

        {/* ================= PROFILE ================= */}

        {activePage === "profile" && (
          <>
            <header>
              <div>
                <span className="eyebrow">HEALTH PROFILE</span>

                <h1>My Health Profile</h1>

                <p className="page-description">
                  Keep your health information updated so Allevia can provide
                  better screening and monitoring.
                </p>
              </div>

              <div className="avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
              </div>
            </header>

            <form className="profile-form" onSubmit={saveProfile}>
              {/* PERSONAL INFORMATION */}

              <section className="panel">
                <div className="section-title">
                  <span className="section-number">01</span>

                  <div>
                    <span className="eyebrow">PERSONAL</span>

                    <h2>Personal Information</h2>
                  </div>
                </div>

                <div className="profile-grid">
                  <div className="field">
                    <label>Full Name</label>

                    <input value={user?.name || ""} disabled />

                    <small>Name is linked to your account.</small>
                  </div>

                  <div className="field">
                    <label>Email</label>

                    <input value={user?.email || ""} disabled />

                    <small>Email is linked to your account.</small>
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
                      <option value="">Select gender</option>

                      <option value="Male">Male</option>

                      <option value="Female">Female</option>

                      <option value="Other">Other</option>

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
                  <span className="section-number">02</span>

                  <div>
                    <span className="eyebrow">MEDICAL</span>

                    <h2>Medical Information</h2>
                  </div>
                </div>

                <div className="profile-grid">
                  <div className="field full">
                    <label>Medical History</label>

                    <textarea
                      placeholder="Describe any previous medical conditions, surgeries, or important medical history..."
                      value={profile.medical_history}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          medical_history: e.target.value,
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
                    <label>Current Health Status</label>

                    <textarea
                      placeholder="Describe your current health condition..."
                      value={profile.current_health_status}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          current_health_status: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field full">
                    <label>Current Symptoms</label>

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

                    <small>Separate multiple symptoms with commas.</small>
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
                  {profileLoading ? "Saving..." : "Save Health Profile"}
                </button>
              </div>
            </form>
          </>
        )}

        {activePage === "lifestyle" && <Lifestyle token={token} />}
        {activePage === "activities" && <Activities token={token} />}
        {activePage === "progress" && <Progress token={token} />}
        {activePage === "screening" && <Screening token={token} />}
        {activePage === "insights" && <Insights token={token} />}
      </main>
    </div>
  );
}

export default App;
