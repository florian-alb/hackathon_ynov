import React from "react";
import { PRESETS, STATUS_META } from "../constants";

export default function Sidebar({
  sidebarOpen,
  mode,
  applyPreset,
  baseUrl,
  setBaseUrl,
  path,
  setPath,
  model,
  setModel,
  status,
  testConnection,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
}) {
  const statusMeta = STATUS_META[status];

  return (
    <aside className={`pft-sidebar ${sidebarOpen ? "" : "closed"}`}>
      <div className="pft-brand">TechCorp Industries</div>
      <div className="pft-brand-sub">CHALLENGE IA — POSTE DEV WEB</div>

      <div className="pft-label">CONNEXION</div>
      <div className="pft-preset-row">
        {Object.keys(PRESETS).map((key) => (
          <button
            key={key}
            className={`pft-preset-btn ${mode === key ? "active" : ""}`}
            onClick={() => applyPreset(key)}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      <div className="pft-field">
        <label>URL du serveur</label>
        <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
      </div>
      {mode !== "ollama" && (
        <div className="pft-field">
          <label>Chemin de l'endpoint</label>
          <input type="text" value={path} onChange={(e) => setPath(e.target.value)} />
        </div>
      )}
      <div className="pft-field">
        <label>Nom du modèle</label>
        <input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
      </div>

      <button className="pft-test-btn" onClick={testConnection} disabled={status === "testing"}>
        {status === "testing" ? "Test en cours…" : "Tester la connexion"}
      </button>
      <div className="pft-status-box" style={{ "--status-color": statusMeta.color }}>
        <span className="pft-dot" />
        <span style={{ color: statusMeta.color }}>{statusMeta.label}</span>
      </div>

      <div className="pft-label">PARAMÈTRES D'INFÉRENCE</div>
      <div className="pft-field">
        <div className="pft-slider-row">
          <span>Température</span>
          <span><b>{temperature.toFixed(2)}</b></span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
        />
      </div>
      <div className="pft-field">
        <div className="pft-slider-row">
          <span>Tokens max</span>
          <span><b>{maxTokens}</b></span>
        </div>
        <input
          type="range"
          min="64"
          max="2048"
          step="64"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
        />
      </div>
    </aside>
  );
}
