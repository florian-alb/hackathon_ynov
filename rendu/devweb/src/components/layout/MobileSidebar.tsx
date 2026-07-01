import { Sidebar } from "@/components/layout/Sidebar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { ChatConversation, ConnectionStatus } from "@/features/chat/types"

export function MobileSidebar({
  activeConversationId,
  activeModel,
  connectionStatus,
  conversations,
  onCreateConversation,
  onDeleteConversation,
  onOpenChange,
  onOpenPromptLibrary,
  onOpenSettings,
  onPinConversation,
  onRenameConversation,
  onSelectConversation,
  open,
}: {
  activeConversationId: string | null
  activeModel: string
  connectionStatus: ConnectionStatus
  conversations: ChatConversation[]
  onCreateConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  onOpenChange: (open: boolean) => void
  onOpenPromptLibrary: () => void
  onOpenSettings: () => void
  onPinConversation: (conversationId: string) => void
  onRenameConversation: (conversationId: string) => void
  onSelectConversation: (conversationId: string) => void
  open: boolean
}) {
  const closeAfter = (callback: () => void) => {
    callback()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[92vw] max-w-sm border-white/[0.08] p-0">
        <SheetTitle className="sr-only">Conversations TechCorp AI</SheetTitle>
        <Sidebar
          activeConversationId={activeConversationId}
          activeModel={activeModel}
          connectionStatus={connectionStatus}
          conversations={conversations}
          onClose={() => onOpenChange(false)}
          onCreateConversation={() => closeAfter(onCreateConversation)}
          onDeleteConversation={(conversationId) =>
            closeAfter(() => onDeleteConversation(conversationId))
          }
          onOpenPromptLibrary={() => closeAfter(onOpenPromptLibrary)}
          onOpenSettings={() => closeAfter(onOpenSettings)}
          onPinConversation={onPinConversation}
          onRenameConversation={onRenameConversation}
          onSelectConversation={(conversationId) =>
            closeAfter(() => onSelectConversation(conversationId))
          }
        />
      </SheetContent>
    </Sheet>
  )
}
