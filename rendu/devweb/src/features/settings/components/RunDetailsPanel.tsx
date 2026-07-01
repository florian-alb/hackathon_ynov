import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RunDetailsState } from "@/features/chat/types"

function formatDuration(durationMs?: number) {
  return typeof durationMs === "number" ? `${durationMs} ms` : "non fourni"
}

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("fr-FR") : "non fourni"
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-lg bg-black/20 px-3 py-2 font-mono text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right text-foreground" title={value}>
        {value}
      </span>
    </div>
  )
}

export function RunDetailsPanel({ details }: { details: RunDetailsState }) {
  const label = {
    idle: "Idle",
    running: "Running",
    success: "OK",
    error: "Erreur",
  }[details.state]

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Détails du dernier run</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Mesures renvoyées par l’appel local.
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[11px]",
            details.state === "running" && "border-amber-300/30 text-amber-100",
            details.state === "success" && "border-teal-300/30 text-teal-100",
            details.state === "error" && "border-red-300/30 text-red-100",
          )}
        >
          {label}
        </Badge>
      </div>

      <div className="mt-4 grid gap-2">
        <DataLine label="Endpoint" value={details.endpoint} />
        <DataLine label="Modèle" value={details.model} />
        <DataLine label="Durée" value={formatDuration(details.durationMs)} />
        <DataLine label="Température" value={String(details.options.temperature)} />
        <DataLine label="Top p" value={String(details.options.top_p)} />
        <DataLine label="Tokens max" value={String(details.options.num_predict)} />
        <DataLine label="Messages" value={String(details.promptMessages)} />
        <DataLine
          label="Prompt eval"
          value={formatCount(details.response?.prompt_eval_count)}
        />
        <DataLine label="Eval" value={formatCount(details.response?.eval_count)} />
      </div>

      {details.error && (
        <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-100">
          {details.error}
        </p>
      )}
    </section>
  )
}
