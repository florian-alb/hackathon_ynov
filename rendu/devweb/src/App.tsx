import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AppLayout } from "@/components/layout/AppLayout"
import { ChatView } from "@/features/chat/components/ChatView"
import { useChatStore } from "@/features/chat/hooks/useChatStore"
import { useOllamaChat } from "@/features/chat/hooks/useOllamaChat"
import { PromptLibraryDialog } from "@/features/prompts/components/PromptLibraryDialog"
import { SettingsDialog } from "@/features/settings/components/SettingsDialog"

const PROMPT_LIBRARY_HASH = "#prompts"

function normalizeModelName(modelName: string) {
  return modelName.endsWith(":latest") ? modelName.slice(0, -7) : modelName
}

function App() {
  const [draft, setDraft] = useState("")
  const [chatSearchOpen, setChatSearchOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const chatStore = useChatStore()
  const ollama = useOllamaChat({
    activeConversation: chatStore.activeConversation,
    appendMessage: chatStore.appendMessage,
    getConversationById: chatStore.getConversationById,
  })

  const modelOptions = Array.from(
    new Set(
      [
        ollama.model,
        ollama.activeModel,
        ...ollama.availableModelNames,
        ollama.fallbackModel,
      ]
        .filter(Boolean)
        .map(normalizeModelName),
    ),
  )

  useEffect(() => {
    const syncPromptRoute = () => {
      setPromptLibraryOpen(window.location.hash === PROMPT_LIBRARY_HASH)
    }

    syncPromptRoute()
    window.addEventListener("hashchange", syncPromptRoute)
    window.addEventListener("popstate", syncPromptRoute)
    return () => {
      window.removeEventListener("hashchange", syncPromptRoute)
      window.removeEventListener("popstate", syncPromptRoute)
    }
  }, [])

  const openPromptLibrary = () => {
    setPromptLibraryOpen(true)
    if (window.location.hash !== PROMPT_LIBRARY_HASH) {
      window.history.pushState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${PROMPT_LIBRARY_HASH}`,
      )
    }
  }

  const setPromptLibraryRouteOpen = (open: boolean) => {
    if (open) {
      openPromptLibrary()
      return
    }

    setPromptLibraryOpen(false)
    if (window.location.hash === PROMPT_LIBRARY_HASH) {
      window.history.pushState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      )
    }
  }

  const createConversation = () => {
    if (chatStore.isActiveConversationDraft) {
      setDraft("")
      return
    }

    chatStore.createConversation(ollama.activeModel)
    setDraft("")
  }

  const renameConversation = (conversationId: string) => {
    const conversation = chatStore.getConversationById(conversationId)
    const nextTitle = window.prompt(
      "Renommer la conversation",
      conversation?.title ?? "",
    )

    if (nextTitle !== null) {
      chatStore.renameConversation(conversationId, nextTitle)
    }
  }

  const deleteConversation = (conversationId: string) => {
    const conversation = chatStore.getConversationById(conversationId)
    const confirmed = window.confirm(
      `Supprimer "${conversation?.title ?? "cette conversation"}" ?`,
    )

    if (!confirmed) return

    chatStore.deleteConversation(conversationId)
    toast.success("Conversation supprimée.")
  }

  const submitPrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) return

    const conversationId =
      chatStore.activeConversation?.id ??
      chatStore.createConversation(ollama.activeModel)

    void ollama.submitPrompt(trimmedPrompt, conversationId)
  }

  return (
    <>
      <AppLayout
        activeConversationId={chatStore.activeConversationId}
        activeModel={ollama.activeModel}
        connectionStatus={ollama.connectionStatus}
        conversations={chatStore.visibleConversations}
        desktopSidebarOpen={desktopSidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        title={chatStore.activeConversation?.title ?? "TechCorp AI"}
        onCreateConversation={createConversation}
        onDeleteConversation={deleteConversation}
        onDesktopSidebarOpenChange={setDesktopSidebarOpen}
        onMobileSidebarOpenChange={setMobileSidebarOpen}
        onOpenChatSearch={() => setChatSearchOpen(true)}
        onOpenPromptLibrary={openPromptLibrary}
        onOpenSettings={() => setSettingsOpen(true)}
        onPinConversation={chatStore.pinConversation}
        onRenameConversation={renameConversation}
        onSelectConversation={chatStore.selectConversation}
      >
        <ChatView
          activeConversation={chatStore.activeConversation}
          activeModel={ollama.activeModel}
          availableModelNames={modelOptions}
          chatError={ollama.chatError}
          chatSearchOpen={chatSearchOpen}
          draft={draft}
          isLoading={ollama.isLoading}
          showRetry={Boolean(ollama.lastFailedPrompt)}
          onChatSearchOpenChange={setChatSearchOpen}
          onDraftChange={setDraft}
          onModelChange={ollama.setModel}
          onOpenPromptLibrary={openPromptLibrary}
          onRetry={ollama.retryLastPrompt}
          onSubmitPrompt={submitPrompt}
        />
      </AppLayout>

      <PromptLibraryDialog
        open={promptLibraryOpen}
        onOpenChange={setPromptLibraryRouteOpen}
        onInsertPrompt={setDraft}
        onSendPrompt={submitPrompt}
      />

      <SettingsDialog
        activeModel={ollama.activeModel}
        activeModelAvailable={ollama.activeModelAvailable}
        availableModelNames={ollama.availableModelNames}
        connectionError={ollama.connectionError}
        connectionStatus={ollama.connectionStatus}
        model={ollama.model}
        open={settingsOpen}
        runDetails={ollama.runDetails}
        onModelChange={ollama.setModel}
        onOpenChange={setSettingsOpen}
        onRefreshConnection={() => void ollama.refreshConnection()}
      />
    </>
  )
}

export default App
