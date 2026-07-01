export const DEFAULT_CONVERSATION_TITLE = "Nouveau chat"

export function generateConversationTitle(input: string): string {
  const normalized = input.replace(/\s+/g, " ").trim()

  if (!normalized) {
    return DEFAULT_CONVERSATION_TITLE
  }

  if (normalized.length <= 50) {
    return normalized
  }

  return `${normalized.slice(0, 50).trim()}...`
}
