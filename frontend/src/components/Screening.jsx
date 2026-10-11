import { useState } from "react";

const SYMPTOMS = [
  { value: "tremor", label: "Tremor" },
  { value: "slow_movement", label: "Slow movement" },
  { value: "balance_difficulty", label: "Balance difficulty" },
  { value: "speech_difficulty", label: "Speech difficulty" },
  { value: "memory_difficulty", label: "Memory difficulty" },
  { value: "sleep_problem", label: "Sleep problem" },
];

function Screening({ token }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  const handleScreening = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Select at least one symptom to continue.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/screening",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symptoms: selectedSymptoms,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Screening failed");
      }

      setResult(data);
      setDisclaimer(data.disclaimer || "");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Neurological Symptom Screening</h1>
          <p>
            Select any symptoms you have noticed for a neurological screening
            estimate.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Neurological symptoms</h2>

        <div className="symptom-grid">
          {SYMPTOMS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`symptom-chip ${
                selectedSymptoms.includes(value) ? "selected" : ""
              }`}
              aria-pressed={selectedSymptoms.includes(value)}
              onClick={() => toggleSymptom(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="primary-button"
          onClick={handleScreening}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Run Health Screening"}
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Rule-based screening estimate</h2>
              <p>This result is not a diagnosis.</p>
            </div>
          </div>

          <div className="screening-result">
            <div className="result-top">
              <h3>{result.risk_level} screening indicator</h3>
              <strong>{result.score}%</strong>
            </div>
            <p>{result.message}</p>
          </div>

          <div className="warning-box">
            <strong>Important:</strong> {disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

export default Screening;