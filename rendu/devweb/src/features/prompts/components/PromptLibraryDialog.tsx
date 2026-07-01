import { useEffect, useMemo, useState } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PromptCard } from "@/features/prompts/components/PromptCard"
import {
  PromptCategoryTabs,
  type PromptCategoryFilter,
} from "@/features/prompts/components/PromptCategoryTabs"
import {
  PROMPT_CATEGORIES,
  PROMPT_LIBRARY,
} from "@/features/prompts/data/prompt-library"

export function PromptLibraryDialog({
  onInsertPrompt,
  onOpenChange,
  onSendPrompt,
  open,
}: {
  onInsertPrompt: (prompt: string) => void
  onOpenChange: (open: boolean) => void
  onSendPrompt: (prompt: string) => void
  open: boolean
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<PromptCategoryFilter>("Tous")

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpenChange, open])

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr-FR")

    return PROMPT_LIBRARY.filter((prompt) => {
      const matchesCategory = category === "Tous" || prompt.category === category
      const searchable = [
        prompt.title,
        prompt.description,
        prompt.category,
        prompt.prompt,
        ...prompt.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("fr-FR")

      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [category, query])

  const insertPrompt = (prompt: string) => {
    onInsertPrompt(prompt)
    onOpenChange(false)
  }

  const sendPrompt = (prompt: string) => {
    onSendPrompt(prompt)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(760px,calc(100dvh-2rem))] w-[min(960px,calc(100vw-2rem))] max-w-none overflow-hidden border-white/[0.1] bg-popover p-0 sm:max-w-none">
        <DialogHeader className="border-b border-white/[0.08] px-5 pb-4 pt-5">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Bibliothèque de prompts
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Choisissez un cas d’analyse financière, insérez-le dans le composer
            ou envoyez-le directement au modèle actif.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-white/[0.08] px-5 py-4">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 rounded-md border-white/[0.1] bg-white/[0.04] pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-300/40"
              placeholder="Rechercher un prompt, une catégorie ou un tag"
            />
          </div>
          <div className="mt-4">
            <PromptCategoryTabs
              categories={PROMPT_CATEGORIES}
              selectedCategory={category}
              onSelectCategory={setCategory}
            />
          </div>
        </div>

        <div className="max-h-[calc(min(760px,100dvh-2rem)-220px)] overflow-y-auto px-5 py-5">
          {filteredPrompts.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onInsert={() => insertPrompt(prompt.prompt)}
                  onSend={() => sendPrompt(prompt.prompt)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/[0.12] bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">
                Aucun prompt trouvé.
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Essayez une recherche plus courte ou revenez sur “Tous” pour
                afficher toute la bibliothèque.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
