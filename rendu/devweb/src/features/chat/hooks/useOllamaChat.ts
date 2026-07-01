import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  DEFAULT_INFERENCE_OPTIONS,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  OLLAMA_PROXY_CHAT_ENDPOINT,
  buildChatPayload,
  checkOllamaConnection,
  normalizeOllamaError,
  sendOllamaChat,
  type OllamaModelTag,
} from "@/lib/ollama"
import type {
  ChatConversation,
  ConnectionStatus,
  RunDetailsState,
} from "@/features/chat/types"
import { createChatMessage } from "@/features/chat/hooks/useChatStore"

type UseOllamaChatOptions = {
  activeConversation: ChatConversation | null
  appendMessage: (
    conversationId: string,
    message: ReturnType<typeof createChatMessage>,
    model?: string,
  ) => void
  getConversationById: (conversationId: string) => ChatConversation | null
}

const INITIAL_RUN_DETAILS: RunDetailsState = {
  state: "idle",
  endpoint: OLLAMA_PROXY_CHAT_ENDPOINT,
  model: DEFAULT_MODEL,
  options: DEFAULT_INFERENCE_OPTIONS,
  promptMessages: 0,
}

export function useOllamaChat({
  activeConversation,
  appendMessage,
  getConversationById,
}: UseOllamaChatOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null)
  const [lastFailedConversationId, setLastFailedConversationId] = useState<string | null>(null)
  const [runDetails, setRunDetails] = useState<RunDetailsState>(INITIAL_RUN_DETAILS)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [availableModels, setAvailableModels] = useState<OllamaModelTag[]>([])
  const [model, setModel] = useState(DEFAULT_MODEL)

  const activeModel = model.trim() || DEFAULT_MODEL

  const availableModelNames = useMemo(
    () =>
      availableModels
        .map((entry) => entry.name || entry.model)
        .filter((entry): entry is string => Boolean(entry)),
    [availableModels],
  )

  const activeModelAvailable = useMemo(() => {
    if (connectionStatus !== "connected" || availableModelNames.length === 0) {
      return true
    }

    return availableModelNames.some(
      (name) => name === activeModel || name.startsWith(`${activeModel}:`),
    )
  }, [activeModel, availableModelNames, connectionStatus])

  const refreshConnection = useCallback(async (signal?: AbortSignal) => {
    setConnectionStatus("checking")
    setConnectionError(null)

    try {
      const models = await checkOllamaConnection(signal)

      setAvailableModels(models)
      setConnectionStatus("connected")
    } catch (cause) {
      if (signal?.aborted) {
        return
      }

      const message = normalizeOllamaError(cause instanceof Error ? cause.message : "")

      setAvailableModels([])
      setConnectionStatus("disconnected")
      setConnectionError(message)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    void refreshConnection(controller.signal)

    return () => controller.abort()
  }, [refreshConnection])

  const submitPrompt = useCallback(
    async (prompt: string, targetConversationId?: string) => {
      const trimmedPrompt = prompt.trim()

      if (!trimmedPrompt || isLoading) {
        return
      }

      const conversation =
        (targetConversationId ? getConversationById(targetConversationId) : activeConversation) ??
        null

      if (!conversation) {
        toast.error("Aucune conversation active.")
        return
      }

      const conversationId = conversation.id
      const userMessage = createChatMessage("user", trimmedPrompt)
      const nextMessages = [...conversation.messages, userMessage]
      const payload = buildChatPayload(activeModel, nextMessages)
      const startedAt = new Date().toISOString()

      appendMessage(conversationId, userMessage, activeModel)
      setChatError(null)
      setLastFailedPrompt(null)
      setLastFailedConversationId(null)
      setIsLoading(true)
      setRunDetails({
        state: "running",
        endpoint: OLLAMA_PROXY_CHAT_ENDPOINT,
        model: activeModel,
        startedAt,
        options: payload.options,
        promptMessages: payload.messages.length,
      })

      try {
        const result = await sendOllamaChat(payload)
        const assistantMessage = createChatMessage(
          "assistant",
          result.content || "Réponse vide renvoyée par Ollama.",
        )

        appendMessage(conversationId, assistantMessage, activeModel)
        setRunDetails((current) => ({
          ...current,
          state: "success",
          durationMs: result.durationMs,
          response: {
            prompt_eval_count: result.data?.prompt_eval_count,
            eval_count: result.data?.eval_count,
          },
        }))
      } catch (cause) {
        const message = normalizeOllamaError(cause instanceof Error ? cause.message : "")

        setChatError(message)
        setLastFailedPrompt(trimmedPrompt)
        setLastFailedConversationId(conversationId)
        setRunDetails((current) => ({
          ...current,
          state: "error",
          error: message,
        }))
        toast.error("Ollama n’a pas répondu", {
          description: message,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [activeConversation, activeModel, appendMessage, getConversationById, isLoading],
  )

  const retryLastPrompt = useCallback(() => {
    if (lastFailedPrompt) {
      void submitPrompt(lastFailedPrompt, lastFailedConversationId ?? undefined)
    }
  }, [lastFailedConversationId, lastFailedPrompt, submitPrompt])

  return {
    activeModel,
    activeModelAvailable,
    availableModelNames,
    chatError,
    connectionError,
    connectionStatus,
    fallbackModel: FALLBACK_MODEL,
    isLoading,
    lastFailedPrompt,
    model,
    refreshConnection,
    retryLastPrompt,
    runDetails,
    setModel,
    submitPrompt,
  }
}
