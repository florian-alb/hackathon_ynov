import { CopyIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/features/chat/types"

export function ChatMessageItem({
  isSelectedSearchResult,
  message,
  searchQuery,
}: {
  isSelectedSearchResult: boolean
  message: ChatMessage
  searchQuery: string
}) {
  const isUser = message.role === "user"
  const matchesSearch =
    searchQuery.trim().length > 0 &&
    message.content.toLocaleLowerCase("fr-FR").includes(searchQuery.toLocaleLowerCase("fr-FR"))

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success("Réponse copiée.")
    } catch {
      toast.error("Impossible de copier la réponse.")
    }
  }

  return (
    <article
      id={`message-${message.id}`}
      className={cn(
        "mx-auto w-full max-w-3xl px-4 py-3",
        isSelectedSearchResult && "rounded-2xl bg-[#1f1f1f]",
      )}
    >
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap break-words text-[15px] leading-7 text-[#ececec]",
            isUser
              ? "max-w-[78%] rounded-[22px] bg-[#2f2f2f] px-5 py-2.5"
              : "w-full px-1 py-1",
            matchesSearch && "ring-2 ring-[#5f5f5f]",
          )}
        >
          {message.content}
        </div>
      </div>

      {!isUser && (
        <div className="mt-1 flex justify-start opacity-70 transition-opacity hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            className="size-8 text-[#b4b4b4] hover:bg-[#1f1f1f] hover:text-white"
            onClick={copyMessage}
            aria-label="Copier la réponse"
          >
            <CopyIcon />
          </Button>
        </div>
      )}
    </article>
  )
}
