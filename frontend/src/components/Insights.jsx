import { useEffect, useState } from "react";

function Insights({ token }) {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/insights",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load health insights");
      }

      const data = await response.json();

      setInsights(data.insights || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Health Insights</h1>
        <p>Analyzing your health data...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Health Insights</h1>
          <p>
            Personalized observations based on your tracked health data.
          </p>
        </div>
      </div>

      {/* Summary */}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Activities</span>
          <strong>{summary.activities || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{summary.completed_activities || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Lifestyle Logs</span>
          <strong>{summary.lifestyle_logs || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Medications</span>
          <strong>{summary.medications || 0}</strong>
        </div>
      </div>

      {/* Insights */}

      <div className="card">
        <div className="section-heading">
          <div>
            <h2>Your Health Insights</h2>
            <p>
              Review patterns detected from your tracked information.
            </p>
          </div>
        </div>

        <div className="insights-list">
          {insights.map((insight, index) => (
            <div
              className={`insight-card ${insight.type}`}
              key={`${insight.category}-${index}`}
            >
              <div className="insight-icon">
                {insight.type === "positive"
                  ? "✓"
                  : insight.type === "warning"
                  ? "!"
                  : "i"}
              </div>

              <div className="insight-content">
                <div className="insight-header">
                  <h3>{insight.title}</h3>

                  <span className="insight-category">
                    {insight.category}
                  </span>
                </div>

                <p>{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="warning-box">
        <strong>Health Notice:</strong>{" "}
        These insights are generated from the information you track
        in Allevia. They are not a medical diagnosis or a replacement
        for professional medical advice.
      </div>
    </div>
  );
}

export default Insights;