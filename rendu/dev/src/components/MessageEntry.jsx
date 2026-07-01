import React from "react";

export default function MessageEntry({ message, index }) {
  const roleLabel =
    message.role === "user" ? "VOUS" : message.role === "assistant" ? "PHI-3.5" : "SYSTÈME";

  return (
    <div className={`pft-entry ${message.role}`}>
      <div className="pft-idx">{String(index + 1).padStart(3, "0")}</div>
      <div className="pft-meta">
        <span className={`pft-role ${message.role}`}>{roleLabel}</span>
        <span className="pft-ts">{message.ts}</span>
      </div>
      <div className={`pft-content ${message.error ? "error" : ""}`}>
        {message.content}
        {message.pending && <span className="pft-cursor" />}
      </div>
    </div>
  );
}
