import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

function Progress({ token }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(`${API}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to load progress");
        return;
      }

      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error("Progress loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [token]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="empty-state">
          Loading your progress...
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <h3>Unable to load progress</h3>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  const {
    activities,
    lifestyle,
    medication,
  } = progress;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div className="eyebrow">HEALTH INSIGHTS</div>
          <h1>Progress</h1>
          <p>
            Track your activity, lifestyle, and medication
            progress in one place.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Activity Completion</span>
          <strong>
            {activities.completion_percentage}%
          </strong>
          <small>
            {activities.completed} of {activities.total} completed
          </small>
        </div>

        <div className="stat-card">
          <span>Average Sleep</span>
          <strong>
            {lifestyle.average_sleep_hours}h
          </strong>
          <small>Based on recorded logs</small>
        </div>

        <div className="stat-card">
          <span>Activity Time</span>
          <strong>
            {lifestyle.total_activity_minutes}m
          </strong>
          <small>Total recorded activity</small>
        </div>

        <div className="stat-card">
          <span>Medication Adherence</span>
          <strong>
            {medication.adherence_percentage}%
          </strong>
          <small>
            {medication.total_taken} doses taken
          </small>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">ACTIVITIES</div>
              <h2>Activity Progress</h2>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-label">
              <span>Completion</span>
              <strong>
                {activities.completion_percentage}%
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${activities.completion_percentage}%`,
                }}
              />
            </div>

            <div className="progress-summary">
              <div>
                <strong>{activities.completed}</strong>
                <span>Completed</span>
              </div>

              <div>
                <strong>{activities.pending}</strong>
                <span>Pending</span>
              </div>

              <div>
                <strong>{activities.total}</strong>
                <span>Total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">MEDICATION</div>
              <h2>Medication Adherence</h2>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-label">
              <span>Adherence</span>
              <strong>
                {medication.adherence_percentage}%
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${medication.adherence_percentage}%`,
                }}
              />
            </div>

            <div className="progress-summary">
              <div>
                <strong>{medication.total_taken}</strong>
                <span>Taken</span>
              </div>

              <div>
                <strong>{medication.total_missed}</strong>
                <span>Missed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="eyebrow">LIFESTYLE</div>
            <h2>Lifestyle Summary</h2>
          </div>
        </div>

        <div className="progress-summary">
          <div>
            <strong>
              {lifestyle.average_sleep_hours}h
            </strong>
            <span>Average Sleep</span>
          </div>

          <div>
            <strong>
              {lifestyle.total_activity_minutes}m
            </strong>
            <span>Activity Time</span>
          </div>

          <div>
            <strong>{lifestyle.logs}</strong>
            <span>Health Logs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;