import { useState, useCallback } from "react";
import { PRESETS } from "../constants";

/**
 * Gère le preset actif (Ollama / Triton / maison), les champs de config
 * (URL, chemin, modèle, température, tokens max) et le test de statut.
 */
export function useConnection() {
  const [mode, setMode] = useState("ollama");
  const [baseUrl, setBaseUrl] = useState(PRESETS.ollama.baseUrl);
  const [path, setPath] = useState(PRESETS.ollama.path);
  const [model, setModel] = useState(PRESETS.ollama.model);
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(512);

  const [status, setStatus] = useState("idle"); // idle | testing | online | offline
  const [latency, setLatency] = useState(null);

  function applyPreset(key) {
    setMode(key);
    setBaseUrl(PRESETS[key].baseUrl);
    setPath(PRESETS[key].path);
    setModel(PRESETS[key].model);
    setStatus("idle");
    setLatency(null);
  }

  const testConnection = useCallback(async () => {
    setStatus("testing");
    const start = performance.now();
    try {
      let url = baseUrl;
      if (mode === "ollama") url = baseUrl.replace(/\/$/, "") + "/api/tags";
      else if (mode === "triton") url = baseUrl.replace(/\/$/, "") + "/v2/health/ready";
      const res = await fetch(url, { method: "GET" });
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setStatus(res.ok ? "online" : "offline");
    } catch (e) {
      setLatency(null);
      setStatus("offline");
    }
  }, [baseUrl, mode]);

  return {
    mode,
    baseUrl,
    setBaseUrl,
    path,
    setPath,
    model,
    setModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    status,
    setStatus,
    latency,
    applyPreset,
    testConnection,
  };
}
