import { type FormEvent, type KeyboardEvent } from "react"
import {
  BooksIcon,
  CaretDownIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function ChatComposer({
  draft,
  availableModelNames = [],
  isLoading,
  mode = "thread",
  modelLabel,
  onChange,
  onModelChange,
  onOpenPromptLibrary,
  onSubmit,
}: {
  draft: string
  availableModelNames?: string[]
  isLoading: boolean
  mode?: "home" | "thread"
  modelLabel?: string
  onChange: (value: string) => void
  onModelChange?: (value: string) => void
  onOpenPromptLibrary: () => void
  onSubmit: () => void
}) {
  const canSubmit = draft.trim().length > 0 && !isLoading
  const modelOptions = Array.from(
    new Set([modelLabel, ...availableModelNames].filter(Boolean) as string[]),
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canSubmit) onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (canSubmit) onSubmit()
    }
  }

  return (
    <form
      className={cn(
        "w-full px-4 sm:px-6",
        mode === "thread" && "border-t border-white/[0.08] bg-background/95 py-4",
      )}
      onSubmit={handleSubmit}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-3xl rounded-lg border border-white/[0.1] bg-composer p-2 shadow-[0_18px_50px_rgba(0,0,0,0.24)]",
          mode === "home" && "max-w-[820px]",
        )}
      >
        <Textarea
          value={draft}
          disabled={isLoading}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "resize-none border-0 bg-transparent px-2 py-2 text-[15px] leading-6 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0",
            mode === "home" ? "min-h-[52px]" : "min-h-[72px]",
          )}
          placeholder="Demandez une analyse, un risque, une synthèse obligataire ou une note de comité..."
        />
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/[0.08] px-1 pt-2">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              onClick={onOpenPromptLibrary}
            >
              <BooksIcon className="size-4" />
              Prompts
            </Button>
            <label className="group/model relative inline-flex min-w-0 items-center">
              <span className="sr-only">Choisir le modèle Ollama</span>
              <select
                value={modelLabel}
                disabled={!onModelChange || isLoading || modelOptions.length === 0}
                onChange={(event) => onModelChange?.(event.target.value)}
                className="h-8 max-w-[156px] appearance-none truncate rounded-md border border-white/[0.08] bg-white/[0.04] py-1 pl-2 pr-7 font-mono text-xs text-muted-foreground outline-none transition-colors hover:border-emerald-300/25 hover:text-foreground focus:border-emerald-300/35 focus:ring-2 focus:ring-emerald-300/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {modelOptions.map((modelName) => (
                  <option key={modelName} value={modelName} className="bg-popover">
                    {modelName}
                  </option>
                ))}
              </select>
              <CaretDownIcon className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" />
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-xs text-background opacity-0 shadow-lg transition-opacity group-hover/model:opacity-100 group-focus-within/model:opacity-100"
              >
                Choisir le modèle utilisé pour le prochain message
              </span>
            </label>
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-9 shrink-0 gap-2 rounded-md bg-emerald-400 px-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <PaperPlaneTiltIcon className="size-4" weight="fill" />
            Envoyer
          </Button>
        </div>
      </div>
    </form>
  )
}
