import React from "react";

export const TERMINAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .pft-root {
    --ink: #0B1220;
    --panel: #101A2C;
    --raise: #182640;
    --paper: #F3EFE4;
    --gold: #C9A227;
    --gold-bright: #E8C158;
    --text: #E7E2D3;
    --muted: #7C879C;
    --green: #4ADE80;
    --red: #F87171;
    --line: rgba(201,162,39,0.16);

    background: var(--ink);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    width: 100%;
    height: 100vh;
    min-height: 620px;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--line);
    position: relative;
  }

  /* ---------- Ticker ---------- */
  .pft-ticker {
    background: linear-gradient(180deg, #0d1524, #0a0f1c);
    border-bottom: 1px solid var(--line);
    overflow: hidden;
    white-space: nowrap;
    padding: 6px 0;
    flex-shrink: 0;
  }
  .pft-ticker-track {
    display: inline-flex;
    gap: 48px;
    animation: pft-scroll 22s linear infinite;
    padding-left: 100%;
  }
  @media (prefers-reduced-motion: reduce) {
    .pft-ticker-track { animation: none; padding-left: 16px; }
  }
  @keyframes pft-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }
  .pft-tick {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--muted);
  }
  .pft-tick b { color: var(--gold-bright); font-weight: 600; }
  .pft-tick .dot { color: var(--line); margin: 0 10px; }

  /* ---------- Body layout ---------- */
  .pft-body { display: flex; flex: 1; min-height: 0; }

  .pft-sidebar {
    width: 268px;
    flex-shrink: 0;
    background: var(--panel);
    border-right: 1px solid var(--line);
    padding: 18px 16px 16px;
    overflow-y: auto;
    transition: margin-left 0.25s ease;
  }
  .pft-sidebar.closed { margin-left: -268px; }

  .pft-brand {
    font-family: 'Fraunces', serif;
    font-weight: 600;
    font-size: 15px;
    color: var(--paper);
    letter-spacing: 0.01em;
    margin-bottom: 2px;
  }
  .pft-brand-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: var(--gold);
    letter-spacing: 0.12em;
    margin-bottom: 20px;
  }

  .pft-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--muted);
    margin: 18px 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pft-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--line);
  }

  .pft-preset-row { display: flex; gap: 6px; }
  .pft-preset-btn {
    flex: 1;
    background: var(--raise);
    border: 1px solid var(--line);
    color: var(--muted);
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    padding: 7px 4px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .pft-preset-btn:hover { border-color: var(--gold); color: var(--paper); }
  .pft-preset-btn.active {
    background: var(--gold);
    border-color: var(--gold);
    color: #14100a;
    font-weight: 600;
  }

  .pft-field { margin-top: 10px; }
  .pft-field label {
    display: block;
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 5px;
  }
  .pft-field input[type="text"], .pft-field input[type="number"] {
    width: 100%;
    background: #0B1424;
    border: 1px solid var(--line);
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    padding: 8px 9px;
    border-radius: 6px;
    box-sizing: border-box;
  }
  .pft-field input:focus { outline: none; border-color: var(--gold); }

  .pft-slider-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }
  .pft-slider-row span b { color: var(--paper); font-family: 'IBM Plex Mono', monospace; }
  .pft-field input[type="range"] {
    width: 100%;
    accent-color: var(--gold);
    margin-top: 6px;
  }

  .pft-test-btn {
    width: 100%;
    margin-top: 14px;
    background: transparent;
    border: 1px solid var(--gold);
    color: var(--gold-bright);
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 12px;
    padding: 9px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .pft-test-btn:hover { background: rgba(201,162,39,0.12); }
  .pft-test-btn:disabled { opacity: 0.5; cursor: default; }

  .pft-status-box {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
  }
  .pft-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--status-color);
    box-shadow: 0 0 8px var(--status-color);
  }

  /* ---------- Chat / ledger ---------- */
  .pft-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--ink); }

  .pft-topbar {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 18px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }
  .pft-topbar h1 {
    font-family: 'Fraunces', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--paper);
    margin: 0;
  }
  .pft-toggle-btn {
    background: none; border: 1px solid var(--line); color: var(--muted);
    width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .pft-toggle-btn:hover { border-color: var(--gold); color: var(--gold-bright); }

  .pft-ledger {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
  }
  .pft-entry {
    display: grid;
    grid-template-columns: 46px 90px 1fr;
    gap: 14px;
    padding: 10px 18px;
    border-bottom: 1px solid rgba(201,162,39,0.06);
  }
  .pft-entry.system { opacity: 0.75; }
  .pft-idx { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--line); padding-top: 2px; }
  .pft-meta { display: flex; flex-direction: column; gap: 3px; }
  .pft-role {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    width: fit-content;
  }
  .pft-role.user { color: var(--paper); background: rgba(231,226,211,0.08); }
  .pft-role.assistant { color: #14100a; background: var(--gold); }
  .pft-role.system { color: var(--muted); background: transparent; border: 1px dashed var(--line); }
  .pft-ts { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); }
  .pft-content {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .pft-content.error { color: var(--red); }
  .pft-cursor { display: inline-block; width: 6px; height: 13px; background: var(--gold-bright); margin-left: 2px; animation: pft-blink 1s step-end infinite; vertical-align: middle; }
  @keyframes pft-blink { 50% { opacity: 0; } }

  .pft-inputbar {
    border-top: 1px solid var(--line);
    padding: 12px 18px 16px;
    flex-shrink: 0;
    background: var(--panel);
  }
  .pft-inputrow {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    background: #0B1424;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 9px 10px;
  }
  .pft-inputrow:focus-within { border-color: var(--gold); }
  .pft-prompt { font-family: 'IBM Plex Mono', monospace; color: var(--gold); font-size: 14px; padding-bottom: 2px; }
  .pft-inputrow textarea {
    flex: 1;
    background: none;
    border: none;
    resize: none;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    line-height: 1.4;
    max-height: 120px;
    padding: 3px 0;
  }
  .pft-inputrow textarea:focus { outline: none; }
  .pft-send-btn, .pft-stop-btn {
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 12.5px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .pft-send-btn { background: var(--gold); color: #14100a; }
  .pft-send-btn:hover { background: var(--gold-bright); }
  .pft-send-btn:disabled { opacity: 0.4; cursor: default; }
  .pft-stop-btn { background: rgba(248,113,113,0.14); color: var(--red); border: 1px solid var(--red); }
  .pft-hint { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); margin-top: 6px; padding-left: 2px; }

  @media (max-width: 720px) {
    .pft-sidebar { position: absolute; z-index: 10; height: 100%; box-shadow: 20px 0 30px rgba(0,0,0,0.4); }
    .pft-sidebar.closed { margin-left: -268px; }
    .pft-entry { grid-template-columns: 30px 1fr; }
    .pft-meta { flex-direction: row; align-items: center; gap: 8px; }
    .pft-idx { display: none; }
  }
`;

export default function TerminalStyles() {
  return <style>{TERMINAL_CSS}</style>;
}