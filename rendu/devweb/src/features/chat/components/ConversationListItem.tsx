import { PencilSimpleIcon, PushPinIcon, TrashIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import type { ChatConversation } from "@/features/chat/types"
import { cn } from "@/lib/utils"

export function ConversationListItem({
  conversation,
  isActive,
  onDelete,
  onPin,
  onRename,
  onSelect,
}: {
  conversation: ChatConversation
  isActive: boolean
  onDelete: () => void
  onPin: () => void
  onRename: () => void
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        "group relative rounded-md transition-colors",
        isActive && "bg-emerald-300/[0.08]",
      )}
    >
      <button
        type="button"
        className="flex h-9 w-full items-center rounded-md px-2 pr-20 text-left text-sm font-medium text-sidebar-foreground outline-none transition-colors hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-emerald-300/40"
        onClick={onSelect}
      >
        <span className="truncate">{conversation.title}</span>
      </button>
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md bg-sidebar/95 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
          aria-label={conversation.pinned ? "Désépingler" : "Épingler"}
          onClick={onPin}
        >
          <PushPinIcon weight={conversation.pinned ? "fill" : "regular"} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
          aria-label="Renommer"
          onClick={onRename}
        >
          <PencilSimpleIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 text-muted-foreground hover:bg-red-400/[0.12] hover:text-red-200"
          aria-label="Supprimer"
          onClick={onDelete}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  )
}
