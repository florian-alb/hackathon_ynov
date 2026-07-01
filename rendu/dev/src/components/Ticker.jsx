import React from "react";
import { PRESETS, STATUS_META } from "../constants";

export default function Ticker({ mode, status, latency, tokPerSec, model }) {
  const statusMeta = STATUS_META[status];

  const content = (
    <>
      TECHCORP <b>PHI-3.5-FINANCIAL</b> TERMINAL<span className="dot">·</span>
      MODE: <b>{PRESETS[mode].label.toUpperCase()}</b><span className="dot">·</span>
      STATUT: <b style={{ color: statusMeta.color }}>{statusMeta.label}</b><span className="dot">·</span>
      LATENCE: <b>{latency !== null ? latency + " ms" : "—"}</b><span className="dot">·</span>
      DÉBIT: <b>{tokPerSec ? tokPerSec + " tok/s" : "—"}</b><span className="dot">·</span>
      MODÈLE: <b>{model}</b>
    </>
  );

  return (
    <div className="pft-ticker">
      <div className="pft-tick pft-ticker-track">
        <span>{content}</span>
        <span aria-hidden="true">{content}</span>
      </div>
    </div>
  );
}
