export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export type ChatConversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  model: string
  pinned?: boolean
}

export type ConnectionStatus = "checking" | "connected" | "disconnected" | "error"

export type ChatSearchResult = {
  conversationId: string
  messageId?: string
  title: string
  excerpt: string
}

export type RunDetailsState = {
  state: "idle" | "running" | "success" | "error"
  endpoint: string
  model: string
  startedAt?: string
  durationMs?: number
  options: {
    temperature: number
    top_p: number
    num_predict: number
  }
  promptMessages: number
  response?: {
    prompt_eval_count?: number
    eval_count?: number
  }
  error?: string
}
