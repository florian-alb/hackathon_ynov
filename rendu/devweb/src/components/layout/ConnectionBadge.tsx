import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConnectionStatus } from "@/features/chat/types"

export function ConnectionBadge({
  compact = false,
  status,
}: {
  compact?: boolean
  status: ConnectionStatus
}) {
  const label = {
    checking: "Vérification",
    connected: "Connecté",
    disconnected: "Déconnecté",
    error: "Erreur",
  }[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 border-white/10 bg-white/[0.03] font-mono text-[11px]",
        compact && "px-2",
        status === "connected" && "border-teal-300/30 text-teal-100",
        status === "checking" && "border-amber-300/30 text-amber-100",
        (status === "disconnected" || status === "error") &&
          "border-red-300/30 text-red-100",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "connected" && "bg-teal-300",
          status === "checking" && "bg-amber-200",
          (status === "disconnected" || status === "error") && "bg-red-300",
        )}
      />
      {label}
    </Badge>
  )
}
