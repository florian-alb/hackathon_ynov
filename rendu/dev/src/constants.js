/**
 * Presets de connexion, helpers de formatage et parsing des réponses
 * "format libre" (Triton / serveur maison).
 */

export const PRESETS = {
  ollama: { label: "Ollama", baseUrl: "http://localhost:11434", model: "phi3.5-financial", path: "/api/chat" },
  triton: { label: "Triton", baseUrl: "http://localhost:8000", model: "phi3_financial", path: "/v2/models/phi3_financial/generate" },
  custom: { label: "Serveur maison", baseUrl: "http://localhost:8001", model: "phi3.5-financial", path: "/v1/chat/completions" },
};

export const STATUS_META = {
  idle: { label: "NON TESTÉ", color: "var(--muted)" },
  testing: { label: "TEST EN COURS…", color: "var(--gold-bright)" },
  online: { label: "EN LIGNE", color: "var(--green)" },
  offline: { label: "HORS LIGNE", color: "var(--red)" },
};

export function nowStamp() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

export function extractCustomReply(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.choices?.[0]?.text) return data.choices[0].text;
  if (typeof data.response === "string") return data.response;
  if (typeof data.output === "string") return data.output;
  if (typeof data.text === "string") return data.text;
  if (data.outputs?.[0]?.data?.[0]) return String(data.outputs[0].data[0]);
  return JSON.stringify(data);
}
