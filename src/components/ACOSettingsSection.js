import React from "react";
import HardenedNumberInput from "./HardenedNumberInput";

const ACOSettingsSection = ({
  acoParams,
  setAcoParams,
  mode,
  setMode,
  isLocked,
}) => {
  const handleChange = (key, value) => {
    setAcoParams((prev) => ({ ...prev, [key]: value }));
  };

  const params = [
    {
      key: "nAnts",
      label: "Number of Ants",
      min: 5,
      max: 100,
      step: 1,
      hint: "Agents exploring routes",
    },
    {
      key: "nIter",
      label: "Iterations",
      min: 10,
      max: 300,
      step: 1,
      hint: "Convergence cycles",
    },
    {
      key: "alpha",
      label: "Alpha (α)",
      min: 0.1,
      max: 5,
      step: 0.1,
      hint: "Pheromone weight",
    },
    {
      key: "beta",
      label: "Beta (β)",
      min: 0.1,
      max: 10,
      step: 0.1,
      hint: "Distance weight",
    },
    {
      key: "rho",
      label: "Evaporation (ρ)",
      min: 0.01,
      max: 0.99,
      step: 0.01,
      hint: "Decay rate",
    },
    {
      key: "Q",
      label: "Q - Pheromone",
      min: 1,
      max: 1000,
      step: 1,
      hint: "Deposit amount",
    },
  ];

  return (
    <div className="section">
      <div className="section-title">
        <span>🐜</span> ACO Metaheuristic
      </div>
      <div className="tabs">
        <button
          className={`tab ${mode === "auto" ? "active" : ""}`}
          onClick={() => setMode("auto")}
        >
          Auto Mode
        </button>
        <button
          className={`tab ${mode === "debug" ? "active" : ""}`}
          onClick={() => setMode("debug")}
        >
          Debug Mode
        </button>
      </div>

      {mode === "auto" ? (
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
          <p>
            <strong>Recommended parameters for food distribution:</strong>
          </p>
          <ul style={{ paddingLeft: 18, margin: "8px 0" }}>
            <li>
              <strong>30 ants</strong> exploring the route network
            </li>
            <li>
              <strong>80 iterations</strong> for convergence
            </li>
            <li>α = 1.0 · β = 3.0 · ρ = 0.3 · Q = 100</li>
          </ul>
          <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 8 }}>
            Auto mode balances exploration and exploitation for typical delivery
            networks.
          </p>
        </div>
      ) : (
        <div className="debug-params-table">
          {params.map((param) => (
            <div key={param.key} className="debug-param-row">
              <div className="debug-param-label">
                <div className="debug-param-name">{param.label}</div>
                <div className="debug-param-hint">{param.hint}</div>
              </div>
              <div className="debug-param-input">
                <HardenedNumberInput
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={acoParams[param.key]}
                  onChange={(val) => handleChange(param.key, val)}
                  disabled={isLocked}
                  className="debug-input"
                />
                <div className="debug-param-range">
                  {param.min} – {param.max}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="section-hint">
        α↑ = stronger pheromone following · β↑ = greedier toward short distance
      </div>
    </div>
  );
};

export default ACOSettingsSection;
