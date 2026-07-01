import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConnectionBadge } from "@/components/layout/ConnectionBadge"
import {
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  OLLAMA_DISPLAY_BASE_URL,
  OLLAMA_PROXY_CHAT_ENDPOINT,
  OLLAMA_PROXY_TAGS_ENDPOINT,
} from "@/lib/ollama"
import type { ConnectionStatus } from "@/features/chat/types"

export function OllamaConnectionPanel({
  activeModel,
  activeModelAvailable,
  availableModelNames,
  connectionError,
  connectionStatus,
  model,
  onModelChange,
  onRefresh,
}: {
  activeModel: string
  activeModelAvailable: boolean
  availableModelNames: string[]
  connectionError: string | null
  connectionStatus: ConnectionStatus
  model: string
  onModelChange: (value: string) => void
  onRefresh: () => void
}) {
  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Connexion Ollama</h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {OLLAMA_DISPLAY_BASE_URL}
            </p>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </div>
        <div className="mt-4 grid gap-2 font-mono text-xs">
          <div className="flex justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
            <span className="text-muted-foreground">Health</span>
            <span>{OLLAMA_PROXY_TAGS_ENDPOINT}</span>
          </div>
          <div className="flex justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
            <span className="text-muted-foreground">Chat</span>
            <span>{OLLAMA_PROXY_CHAT_ENDPOINT}</span>
          </div>
        </div>
        <Button className="mt-4" variant="outline" size="sm" onClick={onRefresh}>
          <ArrowClockwiseIcon />
          Vérifier la connexion
        </Button>

        {connectionError && (
          <Alert variant="destructive" className="mt-4">
            <WarningCircleIcon />
            <AlertTitle>Serveur indisponible</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <label htmlFor="ollama-model" className="text-sm font-semibold">
          Modèle actif
        </label>
        <Input
          id="ollama-model"
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          className="mt-2 font-mono"
          placeholder={DEFAULT_MODEL}
        />
        {!activeModelAvailable && (
          <p className="mt-2 text-xs leading-5 text-amber-100">
            {activeModel} n’est pas listé dans Ollama. Créez ce modèle ou testez{" "}
            {FALLBACK_MODEL}.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => onModelChange(DEFAULT_MODEL)}>
            {DEFAULT_MODEL}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onModelChange(FALLBACK_MODEL)}>
            {FALLBACK_MODEL}
          </Button>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Modèles détectés</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableModelNames.length > 0 ? (
              availableModelNames.map((name) => (
                <Badge key={name} variant="outline" className="font-mono text-[10px]">
                  {name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">non fourni</span>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
