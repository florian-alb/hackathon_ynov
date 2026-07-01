import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { DEFAULT_MODEL } from "@/lib/ollama"
import type { ChatConversation, ChatMessage, ChatRole } from "@/features/chat/types"
import {
  loadActiveConversationId,
  loadConversations,
  saveActiveConversationId,
  saveConversations,
} from "@/features/chat/services/chat-storage"
import {
  DEFAULT_CONVERSATION_TITLE,
  generateConversationTitle,
} from "@/features/chat/services/chat-title"

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createChatMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

function createEmptyConversation(model = DEFAULT_MODEL): ChatConversation {
  const now = new Date().toISOString()

  return {
    id: createId(),
    title: DEFAULT_CONVERSATION_TITLE,
    messages: [],
    createdAt: now,
    updatedAt: now,
    model,
    pinned: false,
  }
}

export function isDraftConversation(conversation: ChatConversation | null | undefined) {
  return Boolean(
    conversation &&
      conversation.messages.length === 0 &&
      conversation.title === DEFAULT_CONVERSATION_TITLE,
  )
}

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  })
}

function buildInitialState() {
  const { conversations, recovered } = loadConversations()
  const persistedConversations = sortConversations(
    conversations.filter((conversation) => !isDraftConversation(conversation)),
  )
  const storedActiveId = loadActiveConversationId()

  if (persistedConversations.length === 0) {
    const draft = createEmptyConversation()

    return {
      activeConversationId: draft.id,
      conversations: [draft],
      recovered,
    }
  }

  const activeConversationId = persistedConversations.some(
    (conversation) => conversation.id === storedActiveId,
  )
    ? storedActiveId
    : persistedConversations[0]?.id

  return {
    activeConversationId,
    conversations: persistedConversations,
    recovered,
  }
}

export function useChatStore() {
  const initialState = useRef(buildInitialState())
  const [conversations, setConversations] = useState<ChatConversation[]>(
    initialState.current.conversations,
  )
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialState.current.activeConversationId,
  )

  useEffect(() => {
    if (initialState.current.recovered) {
      toast.warning("Certaines conversations locales étaient invalides et ont été ignorées.")
      initialState.current.recovered = false
    }
  }, [])

  useEffect(() => {
    const persistedConversations = conversations.filter(
      (conversation) => !isDraftConversation(conversation),
    )

    if (!saveConversations(persistedConversations)) {
      toast.error("Impossible de sauvegarder les conversations dans ce navigateur.")
    }
  }, [conversations])

  useEffect(() => {
    const activeConversation = conversations.find(
      (conversation) => conversation.id === activeConversationId,
    )

    if (activeConversation && !isDraftConversation(activeConversation)) {
      saveActiveConversationId(activeConversation.id)
    }
  }, [activeConversationId, conversations])

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ??
      conversations[0] ??
      null,
    [activeConversationId, conversations],
  )

  const visibleConversations = useMemo(
    () => conversations.filter((conversation) => !isDraftConversation(conversation)),
    [conversations],
  )

  const getConversationById = useCallback(
    (conversationId: string) =>
      conversations.find((conversation) => conversation.id === conversationId) ?? null,
    [conversations],
  )

  const createConversation = useCallback(
    (model = DEFAULT_MODEL) => {
      if (isDraftConversation(activeConversation)) {
        return activeConversation.id
      }

      const conversation = createEmptyConversation(model)

      setConversations((current) =>
        sortConversations([
          conversation,
          ...current.filter((item) => !isDraftConversation(item)),
        ]),
      )
      setActiveConversationId(conversation.id)

      return conversation.id
    },
    [activeConversation],
  )

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
  }, [])

  const updateConversation = useCallback(
    (
      conversationId: string,
      updater: (conversation: ChatConversation) => ChatConversation,
    ) => {
      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === conversationId ? updater(conversation) : conversation,
          ),
        ),
      )
    },
    [],
  )

  const appendMessage = useCallback(
    (conversationId: string, message: ChatMessage, model?: string) => {
      setConversations((current) =>
        sortConversations(
          current.map((conversation) => {
            if (conversation.id !== conversationId) {
              return conversation
            }

            const shouldRename =
              message.role === "user" &&
              conversation.title === DEFAULT_CONVERSATION_TITLE &&
              conversation.messages.every((existing) => existing.role !== "user")

            return {
              ...conversation,
              title: shouldRename
                ? generateConversationTitle(message.content)
                : conversation.title,
              messages: [...conversation.messages, message],
              model: model ?? conversation.model,
              updatedAt: message.createdAt,
            }
          }),
        ),
      )
    },
    [],
  )

  const renameConversation = useCallback(
    (conversationId: string, title: string) => {
      const nextTitle = title.trim() || DEFAULT_CONVERSATION_TITLE

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        title: nextTitle,
        updatedAt: new Date().toISOString(),
      }))
    },
    [updateConversation],
  )

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => {
      const next = sortConversations(
        current.filter((conversation) => conversation.id !== conversationId),
      )
      const safeNext = next.length > 0 ? next : [createEmptyConversation()]

      setActiveConversationId((currentActiveId) => {
        if (currentActiveId !== conversationId) {
          return currentActiveId
        }

        return safeNext[0]?.id ?? null
      })

      return safeNext
    })
  }, [])

  const clearAllConversations = useCallback(() => {
    const conversation = createEmptyConversation()

    setConversations([conversation])
    setActiveConversationId(conversation.id)
  }, [])

  const pinConversation = useCallback(
    (conversationId: string) => {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        pinned: !conversation.pinned,
        updatedAt: new Date().toISOString(),
      }))
    },
    [updateConversation],
  )

  return {
    activeConversation,
    activeConversationId,
    appendMessage,
    clearAllConversations,
    conversations,
    createConversation,
    deleteConversation,
    getConversationById,
    isActiveConversationDraft: isDraftConversation(activeConversation),
    pinConversation,
    renameConversation,
    selectConversation,
    updateConversation,
    visibleConversations,
  }
}
