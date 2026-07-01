export const OLLAMA_DISPLAY_BASE_URL =
  import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";

export const OLLAMA_PROXY_CHAT_ENDPOINT = "/api/chat";
export const OLLAMA_PROXY_TAGS_ENDPOINT = "/api/tags";

export const DEFAULT_MODEL =
  import.meta.env.VITE_OLLAMA_MODEL ?? "phi3-financial";

export const FALLBACK_MODEL = "phi3.5";

export const SYSTEM_PROMPT =
  "You are a financial assistant specialized in helping financial analysts at TechCorp Industries. Give concise, reliable answers. Do not invent figures. State assumptions clearly. This is not financial advice.";

export const DEFAULT_INFERENCE_OPTIONS = {
  temperature: 0.3,
  top_p: 0.9,
  num_predict: 512,
} as const;

export type ChatRole = "system" | "user" | "assistant";

export type OllamaMessage = {
  role: ChatRole;
  content: string;
};

export type VisibleMessage = {
  id: string;
  role: Extract<ChatRole, "user" | "assistant">;
  content: string;
  createdAt: string;
};

export type InferenceOptions = typeof DEFAULT_INFERENCE_OPTIONS;

export type OllamaChatRequest = {
  model: string;
  messages: OllamaMessage[];
  stream: false;
  options: InferenceOptions;
};

export type OllamaChatResponse = {
  model?: string;
  created_at?: string;
  message?: OllamaMessage;
  done?: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  error?: string;
};

export type OllamaModelTag = {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
};

export type OllamaTagsResponse = {
  models?: OllamaModelTag[];
};

export class OllamaApiError extends Error {
  status?: number;
  details?: string;

  constructor(message: string, status?: number, details?: string) {
    super(message);
    this.name = "OllamaApiError";
    this.status = status;
    this.details = details;
  }
}

export function buildChatMessages(history: VisibleMessage[]): OllamaMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

export function buildChatPayload(
  model: string,
  history: VisibleMessage[],
  options: InferenceOptions = DEFAULT_INFERENCE_OPTIONS,
): OllamaChatRequest {
  return {
    model,
    messages: buildChatMessages(history),
    stream: false,
    options,
  };
}

export async function checkOllamaConnection(signal?: AbortSignal) {
  const response = await fetch(OLLAMA_PROXY_TAGS_ENDPOINT, { signal });

  if (!response.ok) {
    const details = await response.text();
    throw new OllamaApiError(
      response.status >= 500
        ? "Impossible de joindre Ollama. Lancez Ollama puis vérifiez http://localhost:11434/api/tags."
        : normalizeOllamaError(details, response.status),
      response.status,
      details,
    );
  }

  const data = (await response.json()) as OllamaTagsResponse;
  return data.models ?? [];
}

export async function sendOllamaChat(
  request: OllamaChatRequest,
  signal?: AbortSignal,
) {
  const startedAt = performance.now();
  const response = await fetch(OLLAMA_PROXY_CHAT_ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const durationMs = Math.round(performance.now() - startedAt);
  const rawBody = await response.text();
  let data: OllamaChatResponse | undefined;

  try {
    data = rawBody ? (JSON.parse(rawBody) as OllamaChatResponse) : undefined;
  } catch {
    data = undefined;
  }

  if (!response.ok || data?.error) {
    throw new OllamaApiError(
      normalizeOllamaError(data?.error ?? rawBody, response.status),
      response.status,
      rawBody,
    );
  }

  return {
    data,
    durationMs,
    content: data?.message?.content?.trim() ?? "",
  };
}

export function normalizeOllamaError(message: string, status?: number) {
  const lower = message.toLowerCase();

  if (lower.includes("model") && lower.includes("not found")) {
    return "Modèle introuvable dans Ollama. Créez phi3-financial ou basculez temporairement vers phi3.5.";
  }

  if (
    lower.includes("connection") ||
    lower.includes("fetch") ||
    lower.includes("unable to reach ollama") ||
    lower.includes("unknown proxy error")
  ) {
    return "Impossible de joindre Ollama. Vérifiez que le serveur local ou le tunnel ngrok est actif, puis contrôlez VITE_OLLAMA_BASE_URL.";
  }

  if (lower.includes("econnrefused") || lower.includes("proxy error")) {
    return "Impossible de joindre Ollama. Lancez Ollama puis vérifiez http://localhost:11434/api/tags.";
  }

  if (status === 404) {
    return "Endpoint Ollama introuvable. Vérifiez les routes /api et l’URL cible Ollama.";
  }

  if (status && status >= 500) {
    return "Ollama a renvoyé une erreur serveur. Le modèle peut être absent, saturé ou en cours de chargement.";
  }

  return message || "Erreur inconnue pendant l’appel Ollama.";
}
