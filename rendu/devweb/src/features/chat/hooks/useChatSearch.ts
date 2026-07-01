import { useMemo } from "react"
import type { ChatConversation, ChatSearchResult } from "@/features/chat/types"

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("fr-FR")
}

function buildExcerpt(content: string, query: string) {
  const normalizedContent = content.toLocaleLowerCase("fr-FR")
  const normalizedQuery = query.toLocaleLowerCase("fr-FR")
  const index = normalizedContent.indexOf(normalizedQuery)

  if (index < 0) {
    return content.slice(0, 96)
  }

  const start = Math.max(0, index - 36)
  const end = Math.min(content.length, index + normalizedQuery.length + 60)
  const prefix = start > 0 ? "..." : ""
  const suffix = end < content.length ? "..." : ""

  return `${prefix}${content.slice(start, end)}${suffix}`
}

export function useChatSearch(conversations: ChatConversation[], query: string) {
  return useMemo(() => {
    const normalizedQuery = normalize(query)

    if (!normalizedQuery) {
      return {
        filteredConversations: conversations,
        results: [] as ChatSearchResult[],
      }
    }

    const results: ChatSearchResult[] = []
    const matchedIds = new Set<string>()

    conversations.forEach((conversation) => {
      const titleMatches = normalize(conversation.title).includes(normalizedQuery)

      if (titleMatches) {
        matchedIds.add(conversation.id)
        results.push({
          conversationId: conversation.id,
          title: conversation.title,
          excerpt: conversation.messages.at(-1)?.content.slice(0, 96) || "Titre de conversation",
        })
      }

      const matchedMessage = conversation.messages.find((message) =>
        normalize(message.content).includes(normalizedQuery),
      )

      if (matchedMessage) {
        matchedIds.add(conversation.id)

        if (!titleMatches) {
          results.push({
            conversationId: conversation.id,
            messageId: matchedMessage.id,
            title: conversation.title,
            excerpt: buildExcerpt(matchedMessage.content, query),
          })
        }
      }
    })

    return {
      filteredConversations: conversations.filter((conversation) =>
        matchedIds.has(conversation.id),
      ),
      results,
    }
  }, [conversations, query])
}
