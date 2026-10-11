import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

function Activities({ token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Exercise",
    duration_minutes: "",
    difficulty: "Easy",
    scheduled_date: "",
  });

  const loadActivities = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(`${API}/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to load activities");
        return;
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Activities loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addActivity = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter an activity title.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category,
        duration_minutes:
          form.duration_minutes === ""
            ? null
            : Number(form.duration_minutes),
        difficulty: form.difficulty,
        scheduled_date: form.scheduled_date || null,
      };

      const response = await fetch(`${API}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to create activity.");
        return;
      }

      setForm({
        title: "",
        description: "",
        category: "Exercise",
        duration_minutes: "",
        difficulty: "Easy",
        scheduled_date: "",
      });

      await loadActivities();
    } catch (error) {
      console.error("Activity creation error:", error);
      alert("Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  };

  const completeActivity = async (activityId) => {
    try {
      const response = await fetch(
        `${API}/activities/${activityId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Unable to complete activity.");
        return;
      }

      await loadActivities();
    } catch (error) {
      console.error("Activity completion error:", error);
      alert("Unable to connect to the backend.");
    }
  };

  const completedCount = activities.filter(
    (activity) => activity.completed
  ).length;

  const pendingCount = activities.length - completedCount;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="eyebrow">DAILY WELLNESS</div>
          <h1>Activities</h1>
          <p>
            Follow your assigned activities and keep track of your
            daily progress.
          </p>
        </div>
      </div>

      {/* Activity statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Activities</span>
          <strong>{activities.length}</strong>
          <small>Assigned activities</small>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>Activities completed</small>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Still to complete</small>
        </div>

        <div className="stat-card">
          <span>Completion</span>
          <strong>
            {activities.length > 0
              ? `${Math.round(
                  (completedCount / activities.length) * 100
                )}%`
              : "0%"}
          </strong>
          <small>Overall completion</small>
        </div>
      </div>

      <div className="content-grid">
        {/* Create activity */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">NEW ACTIVITY</div>
              <h2>Add Activity</h2>
            </div>
          </div>

          <form onSubmit={addActivity} className="profile-form">
            <div className="form-group">
              <label>Activity Name</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Morning Walk"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the activity..."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Exercise">Exercise</option>
                  <option value="Walking">Walking</option>
                  <option value="Stretching">Stretching</option>
                  <option value="Breathing">Breathing</option>
                  <option value="Meditation">Meditation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  min="1"
                  placeholder="30"
                />
              </div>

              <div className="form-group">
                <label>Scheduled Date</label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={form.scheduled_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add Activity"}
            </button>
          </form>
        </div>

        {/* Activity list */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">YOUR PLAN</div>
              <h2>Assigned Activities</h2>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="empty-state">
              <h3>No activities yet</h3>
              <p>
                Your assigned activities will appear here.
              </p>
            </div>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <div
                  className={`activity-item ${
                    activity.completed ? "completed" : ""
                  }`}
                  key={activity.id}
                >
                  <div className="activity-main">
                    <div>
                      <div className="activity-category">
                        {activity.category}
                      </div>

                      <h3>{activity.title}</h3>

                      {activity.description && (
                        <p>{activity.description}</p>
                      )}
                    </div>

                    <span
                      className={`activity-status ${
                        activity.completed
                          ? "status-completed"
                          : "status-pending"
                      }`}
                    >
                      {activity.completed
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </div>

                  <div className="activity-details">
                    <span>
                      ⏱{" "}
                      {activity.duration_minutes
                        ? `${activity.duration_minutes} min`
                        : "Duration not set"}
                    </span>

                    <span>
                      ◈ {activity.difficulty || "Not specified"}
                    </span>

                    {activity.scheduled_date && (
                      <span>
                        📅 {activity.scheduled_date}
                      </span>
                    )}
                  </div>

                  {!activity.completed && (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        completeActivity(activity.id)
                      }
                    >
                      Mark as Completed
                    </button>
                  )}

                  {activity.completed &&
                    activity.completed_at && (
                      <div className="completed-time">
                        Completed on{" "}
                        {new Date(
                          activity.completed_at
                        ).toLocaleString()}
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

export default Activities;