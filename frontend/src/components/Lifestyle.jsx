import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

function Lifestyle({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    sleep_hours: "",
    activity_minutes: "",
    mood: "",
    symptoms: "",
  });

  const loadLogs = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API}/lifestyle`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Unable to load lifestyle logs");
        return;
      }

      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Lifestyle loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addLog = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        date: form.date,
        sleep_hours:
          form.sleep_hours === "" ? null : Number(form.sleep_hours),
        activity_minutes:
          form.activity_minutes === ""
            ? null
            : Number(form.activity_minutes),
        mood: form.mood || null,
        symptoms: form.symptoms || null,
      };

      const res = await fetch(`${API}/lifestyle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Unable to save lifestyle log");
        return;
      }

      setForm({
        date: today,
        sleep_hours: "",
        activity_minutes: "",
        mood: "",
        symptoms: "",
      });

      await loadLogs();
    } catch (error) {
      console.error("Lifestyle save error:", error);
      alert("Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  };

  const latest = logs.length > 0 ? logs[0] : null;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="eyebrow">DAILY HEALTH</div>
          <h1>Lifestyle</h1>
          <p>
            Track sleep, activity, mood, and symptoms to build a clearer
            picture of your daily health.
          </p>
        </div>
      </div>

      {/* Today's overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Sleep</span>
          <strong>
            {latest?.sleep_hours != null
              ? `${latest.sleep_hours}h`
              : "--"}
          </strong>
          <small>Latest recorded</small>
        </div>

        <div className="stat-card">
          <span>Activity</span>
          <strong>
            {latest?.activity_minutes != null
              ? `${latest.activity_minutes} min`
              : "--"}
          </strong>
          <small>Latest recorded</small>
        </div>

        <div className="stat-card">
          <span>Mood</span>
          <strong>{latest?.mood || "--"}</strong>
          <small>Latest recorded</small>
        </div>

        <div className="stat-card">
          <span>Logs</span>
          <strong>{logs.length}</strong>
          <small>Total records</small>
        </div>
      </div>

      <div className="content-grid">
        {/* Add lifestyle log */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">NEW ENTRY</div>
              <h2>Daily Health Log</h2>
            </div>
          </div>

          <form onSubmit={addLog} className="profile-form">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sleep Hours</label>
                <input
                  type="number"
                  name="sleep_hours"
                  value={form.sleep_hours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.1"
                  placeholder="e.g. 7.5"
                />
              </div>

              <div className="form-group">
                <label>Activity Minutes</label>
                <input
                  type="number"
                  name="activity_minutes"
                  value={form.activity_minutes}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 35"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mood</label>
              <select
                name="mood"
                value={form.mood}
                onChange={handleChange}
              >
                <option value="">Select mood</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Okay">Okay</option>
                <option value="Low">Low</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Symptoms</label>
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                placeholder="Describe any symptoms you experienced today..."
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Health Log"}
            </button>
          </form>
        </div>

        {/* Recent logs */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">HISTORY</div>
              <h2>Recent Logs</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading your health logs...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <h3>No lifestyle logs yet</h3>
              <p>
                Add your first daily health log to start tracking your
                progress.
              </p>
            </div>
          ) : (
            <div className="lifestyle-list">
              {logs.map((log) => (
                <div className="lifestyle-item" key={log.id}>
                  <div className="lifestyle-date">
                    <strong>{log.date}</strong>
                    <span>{log.mood || "No mood recorded"}</span>
                  </div>

                  <div className="lifestyle-metrics">
                    <div>
                      <span>Sleep</span>
                      <strong>
                        {log.sleep_hours != null
                          ? `${log.sleep_hours}h`
                          : "--"}
                      </strong>
                    </div>

                    <div>
                      <span>Activity</span>
                      <strong>
                        {log.activity_minutes != null
                          ? `${log.activity_minutes}m`
                          : "--"}
                      </strong>
                    </div>
                  </div>

                  {log.symptoms && (
                    <div className="lifestyle-symptoms">
                      <span>Symptoms</span>
                      <p>{log.symptoms}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lifestyle;