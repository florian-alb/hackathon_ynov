export type PromptCategory =
  | "Analyse financière"
  | "Risque"
  | "Investissement"
  | "Synthèse"
  | "Audit"
  | "Démo jury"

export type PromptTemplate = {
  id: string
  title: string
  description: string
  category: PromptCategory
  prompt: string
  tags: string[]
}
