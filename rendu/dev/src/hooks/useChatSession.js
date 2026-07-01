import { useState, useRef, useEffect, useCallback } from "react";
import { nowStamp, extractCustomReply } from "../constants";

/**
 * Gère l'historique de messages, l'envoi (streaming NDJSON pour Ollama,
 * réponse unique pour Triton / maison), l'annulation et le débit tok/s.
 * Prend en paramètres les infos de connexion issues de useConnection().
 */
export function useChatSession({ mode, baseUrl, path, model, temperature, maxTokens, setStatus }) {
  const [messages, setMessages] = useState([
    {
      id: "sys-0",
      role: "system",
      content:
        "Terminal initialisé. Configurez la connexion au serveur d'inférence dans le panneau latéral, puis testez la connexion avant d'ouvrir une session.",
      ts: nowStamp(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [tokPerSec, setTokPerSec] = useState(null);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const entryCounter = useRef(1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function pushMessage(msg) {
    setMessages((prev) => [...prev, { ...msg, id: `m-${entryCounter.current++}`, ts: nowStamp() }]);
  }

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    pushMessage({ role: "user", content: text });
    setIsSending(true);

    const history = [...messages, { role: "user", content: text }]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    abortRef.current = controller;
    const assistantId = `m-${entryCounter.current++}`;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", ts: nowStamp(), pending: true }]);

    const genStart = performance.now();
    let tokenCount = 0;

    try {
      if (mode === "ollama") {
        const res = await fetch(baseUrl.replace(/\/$/, "") + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: history,
            stream: true,
            options: { temperature, num_predict: maxTokens },
          }),
        });
        if (!res.ok || !res.body) throw new Error("Réponse serveur invalide (" + res.status + ")");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              const chunk = json.message?.content ?? "";
              if (chunk) {
                acc += chunk;
                tokenCount += 1;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
                );
              }
            } catch {
              /* ligne partielle, ignorée */
            }
          }
        }
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)));
      } else {
        // Triton / Serveur maison : requête unique, format OpenAI-like par défaut.
        const body =
          mode === "triton"
            ? { inputs: [{ name: "prompt", shape: [1], datatype: "BYTES", data: [text] }] }
            : {
                model,
                messages: history,
                temperature,
                max_tokens: maxTokens,
              };

        const res = await fetch(baseUrl.replace(/\/$/, "") + path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Réponse serveur invalide (" + res.status + ")");
        const data = await res.json();
        const reply = extractCustomReply(data);
        tokenCount = Math.round(reply.length / 4);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: reply, pending: false } : m)));
      }

      const elapsedSec = (performance.now() - genStart) / 1000;
      if (tokenCount > 0 && elapsedSec > 0) setTokPerSec((tokenCount / elapsedSec).toFixed(1));
      setStatus("online");
    } catch (err) {
      const msg =
        err.name === "AbortError"
          ? "Génération interrompue."
          : "Échec de connexion au serveur d'inférence. Vérifiez l'URL, le CORS et que le serveur est démarré. Détail : " +
            err.message;
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: msg, pending: false, error: true } : m))
      );
      setStatus("offline");
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  }, [input, isSending, messages, mode, baseUrl, path, model, temperature, maxTokens, setStatus]);

  function stopGeneration() {
    abortRef.current?.abort();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return {
    messages,
    input,
    setInput,
    isSending,
    tokPerSec,
    scrollRef,
    handleSend,
    stopGeneration,
    handleKeyDown,
  };
}
