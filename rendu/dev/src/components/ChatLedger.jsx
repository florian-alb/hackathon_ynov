import React from "react";
import MessageEntry from "./MessageEntry";

export default function ChatLedger({ messages, scrollRef }) {
  return (
    <div className="pft-ledger" ref={scrollRef}>
      {messages.map((m, i) => (
        <MessageEntry key={m.id} message={m} index={i} />
      ))}
    </div>
  );
}
