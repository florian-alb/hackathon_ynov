import { ConversationListItem } from "@/features/chat/components/ConversationListItem"
import type { ChatConversation } from "@/features/chat/types"

export function ConversationList({
  activeConversationId,
  conversations,
  onDelete,
  onPin,
  onRename,
  onSelect,
}: {
  activeConversationId: string | null
  conversations: ChatConversation[]
  onDelete: (conversationId: string) => void
  onPin: (conversationId: string) => void
  onRename: (conversationId: string) => void
  onSelect: (conversationId: string) => void
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-white/[0.08] px-3 py-3 text-sm leading-5 text-muted-foreground">
        Aucune conversation lancée.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onDelete={() => onDelete(conversation.id)}
          onPin={() => onPin(conversation.id)}
          onRename={() => onRename(conversation.id)}
          onSelect={() => onSelect(conversation.id)}
        />
      ))}
    </div>
  )
}
