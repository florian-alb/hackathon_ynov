import { useState } from "react";
import { useConnection } from "./hooks/useConnection";
import { useChatSession } from "./hooks/useChatSession";
import TerminalStyles from "./terminalStyles.jsx";
import Ticker from "./components/Ticker";
import Sidebar from "./components/Sidebar";
import ChatLedger from "./components/ChatLedger";
import InputBar from "./components/InputBar";

export default function PhiFinancialTerminal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
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
  } = useConnection();

  const {
    messages,
    input,
    setInput,
    isSending,
    tokPerSec,
    scrollRef,
    handleSend,
    stopGeneration,
    handleKeyDown,
  } = useChatSession({ mode, baseUrl, path, model, temperature, maxTokens, setStatus });

  return (
    <div className="pft-root">
      <TerminalStyles />

      <Ticker mode={mode} status={status} latency={latency} tokPerSec={tokPerSec} model={model} />

      <div className="pft-body">
        <Sidebar
          sidebarOpen={sidebarOpen}
          mode={mode}
          applyPreset={applyPreset}
          baseUrl={baseUrl}
          setBaseUrl={setBaseUrl}
          path={path}
          setPath={setPath}
          model={model}
          setModel={setModel}
          status={status}
          testConnection={testConnection}
          temperature={temperature}
          setTemperature={setTemperature}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
        />

        <div className="pft-main">
          <div className="pft-topbar">
            <button className="pft-toggle-btn" onClick={() => setSidebarOpen((s) => !s)} aria-label="Basculer le panneau">
              ☰
            </button>
            <h1>Session de chat — Phi-3.5-Financial</h1>
          </div>

          <ChatLedger messages={messages} scrollRef={scrollRef} />

          <InputBar
            input={input}
            setInput={setInput}
            isSending={isSending}
            handleSend={handleSend}
            stopGeneration={stopGeneration}
            handleKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
