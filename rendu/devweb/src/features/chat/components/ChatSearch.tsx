import { useEffect, useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { ChatConversation } from "@/features/chat/types"

export function ChatSearch({
  conversation,
  onOpenChange,
  onQueryChange,
  onSelectedMessageChange,
  open,
}: {
  conversation: ChatConversation | null
  onOpenChange: (open: boolean) => void
  onQueryChange: (query: string) => void
  onSelectedMessageChange: (messageId: string | null) => void
  open: boolean
}) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR")

    if (!conversation || !normalizedQuery) {
      return []
    }

    return conversation.messages.filter((message) =>
      message.content.toLocaleLowerCase("fr-FR").includes(normalizedQuery),
    )
  }, [conversation, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query, conversation?.id])

  useEffect(() => {
    onQueryChange(query)
    onSelectedMessageChange(matches[selectedIndex]?.id ?? null)
  }, [matches, onQueryChange, onSelectedMessageChange, query, selectedIndex])

  const selectOffset = (offset: number) => {
    if (matches.length === 0) {
      return
    }

    setSelectedIndex((current) => (current + offset + matches.length) % matches.length)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Rechercher dans ce chat</DialogTitle>
          <DialogDescription>
            Recherche locale dans les messages de la conversation active.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            placeholder="Terme, ratio, entreprise..."
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {matches.length} résultat{matches.length > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Résultat précédent"
                disabled={matches.length === 0}
                onClick={() => selectOffset(-1)}
              >
                <ArrowUpIcon />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Résultat suivant"
                disabled={matches.length === 0}
                onClick={() => selectOffset(1)}
              >
                <ArrowDownIcon />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
