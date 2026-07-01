import type { PromptCategory } from "@/features/prompts/types"
import { cn } from "@/lib/utils"

export type PromptCategoryFilter = PromptCategory | "Tous"

export function PromptCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: PromptCategory[]
  selectedCategory: PromptCategoryFilter
  onSelectCategory: (category: PromptCategoryFilter) => void
}) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto pb-1">
      {(["Tous", ...categories] as PromptCategoryFilter[]).map((category) => (
        <button
          key={category}
          type="button"
          className={cn(
            "shrink-0 rounded-full border border-white/[0.1] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-300/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40",
            selectedCategory === category &&
              "border-emerald-300/35 bg-emerald-300/[0.1] text-emerald-50",
          )}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
