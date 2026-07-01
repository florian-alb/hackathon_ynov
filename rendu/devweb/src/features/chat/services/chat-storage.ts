import type { ChatConversation, ChatMessage } from "@/features/chat/types"

export const STORAGE_KEY = "techcorp.chat.conversations.v1"
export const ACTIVE_CHAT_KEY = "techcorp.chat.activeConversationId.v1"

type LoadConversationsResult = {
  conversations: ChatConversation[]
  recovered: boolean
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (!isStringRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string"
  )
}

export function isValidConversation(value: unknown): value is ChatConversation {
  if (!isStringRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.messages) &&
    value.messages.every(isValidMessage) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.model === "string" &&
    (typeof value.pinned === "undefined" || typeof value.pinned === "boolean")
  )
}

export function loadConversations(): LoadConversationsResult {
  if (!canUseStorage()) {
    return { conversations: [], recovered: false }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return { conversations: [], recovered: false }
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return { conversations: [], recovered: true }
    }

    const conversations = parsed.filter(isValidConversation)

    return {
      conversations,
      recovered: conversations.length !== parsed.length,
    }
  } catch {
    return { conversations: [], recovered: true }
  }
}

export function saveConversations(conversations: ChatConversation[]) {
  if (!canUseStorage()) {
    return false
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    return true
  } catch {
    return false
  }
}

export function loadActiveConversationId() {
  if (!canUseStorage()) {
    return null
  }

  try {
    return window.localStorage.getItem(ACTIVE_CHAT_KEY)
  } catch {
    return null
  }
}

export function saveActiveConversationId(conversationId: string) {
  if (!canUseStorage()) {
    return false
  }

  try {
    window.localStorage.setItem(ACTIVE_CHAT_KEY, conversationId)
    return true
  } catch {
    return false
  }
}
