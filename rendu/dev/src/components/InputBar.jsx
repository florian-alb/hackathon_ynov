import React from "react";

export default function InputBar({ input, setInput, isSending, handleSend, stopGeneration, handleKeyDown }) {
  return (
    <div className="pft-inputbar">
      <div className="pft-inputrow">
        <span className="pft-prompt">›</span>
        <textarea
          rows={1}
          placeholder="Posez une question au modèle financier…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        {isSending ? (
          <button className="pft-stop-btn" onClick={stopGeneration}>Arrêter</button>
        ) : (
          <button className="pft-send-btn" onClick={handleSend} disabled={!input.trim()}>Envoyer</button>
        )}
      </div>
      <div className="pft-hint">Entrée pour envoyer · Maj+Entrée pour un saut de ligne</div>
    </div>
  );
}
