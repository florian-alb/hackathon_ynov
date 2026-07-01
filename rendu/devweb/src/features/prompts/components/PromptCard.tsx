import { PaperPlaneTiltIcon, PlusIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PromptTemplate } from "@/features/prompts/types"

export function PromptCard({
  prompt,
  onInsert,
  onSend,
}: {
  prompt: PromptTemplate
  onInsert: () => void
  onSend: () => void
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{prompt.title}</h3>
        <Badge variant="outline" className="font-mono text-[10px]">
          {prompt.category}
        </Badge>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{prompt.description}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground/90">
        {prompt.prompt}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onInsert}>
          <PlusIcon />
          Insérer
        </Button>
        <Button type="button" size="sm" onClick={onSend}>
          <PaperPlaneTiltIcon weight="fill" />
          Envoyer
        </Button>
      </div>
    </article>
  )
}
