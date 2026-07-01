import {
  BooksIcon,
  GearSixIcon,
  ListIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import type { ConnectionStatus } from "@/features/chat/types"
import { cn } from "@/lib/utils"

export function ChatHeader({
  activeModel,
  connectionStatus,
  title,
  onOpenChatSearch,
  onOpenMobileSidebar,
  onOpenPromptLibrary,
  onOpenSettings,
}: {
  activeModel: string
  connectionStatus: ConnectionStatus
  title: string
  onOpenChatSearch: () => void
  onOpenMobileSidebar: () => void
  onOpenPromptLibrary: () => void
  onOpenSettings: () => void
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-background/95 px-3 lg:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          size="icon-sm"
          variant="ghost"
          aria-label="Ouvrir les conversations"
          onClick={onOpenMobileSidebar}
        >
          <ListIcon />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-foreground">
            {title || "TechCorp AI"}
          </h1>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {activeModel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span
          className={cn(
            "mr-1 size-2 rounded-full",
            connectionStatus === "connected" && "bg-emerald-300",
            connectionStatus === "checking" && "bg-amber-300",
            connectionStatus === "disconnected" && "bg-red-300",
          )}
          aria-label={connectionStatus}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Rechercher"
          onClick={onOpenChatSearch}
        >
          <MagnifyingGlassIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Prompts"
          onClick={onOpenPromptLibrary}
        >
          <BooksIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Paramètres"
          onClick={onOpenSettings}
        >
          <GearSixIcon />
        </Button>
      </div>
    </header>
  )
}
