import { useEffect, useRef } from "react"
import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatMessageItem } from "@/features/chat/components/ChatMessageItem"
import type { ChatMessage } from "@/features/chat/types"

export function ChatMessageList({
  chatError,
  isLoading,
  messages,
  onRetry,
  searchQuery,
  selectedSearchMessageId,
  showRetry,
}: {
  chatError: string | null
  isLoading: boolean
  messages: ChatMessage[]
  onRetry: () => void
  searchQuery: string
  selectedSearchMessageId: string | null
  showRetry: boolean
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedSearchMessageId) {
      document
        .getElementById(`message-${selectedSearchMessageId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [isLoading, messages.length, selectedSearchMessageId])

  return (
    <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto">
      <div className="py-6">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            searchQuery={searchQuery}
            isSelectedSearchResult={message.id === selectedSearchMessageId}
          />
        ))}

        {isLoading && (
          <article className="mx-auto w-full max-w-3xl px-4 py-3">
            <div className="min-w-0">
              <p className="sr-only">Analyse en cours</p>
              <div className="rounded-2xl bg-transparent px-1 py-4">
                <div className="grid gap-3">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </article>
        )}

        {chatError && (
          <div className="mx-auto max-w-3xl px-4 py-3">
            <Alert variant="destructive">
              <WarningCircleIcon />
              <AlertTitle>Erreur Ollama</AlertTitle>
              <AlertDescription>
                <span>{chatError}</span>
                {showRetry && (
                  <Button className="mt-3" variant="outline" size="sm" onClick={onRetry}>
                    <ArrowClockwiseIcon />
                    Réessayer
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
