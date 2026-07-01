export function EmptyChatState() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-3 inline-flex h-8 items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/[0.08] px-3 text-xs font-semibold text-emerald-100">
        <span className="size-1.5 rounded-full bg-emerald-300" />
        Démo jury prête
      </div>
      <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        Posez une question financière au modèle TechCorp.
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Le chat garde le contexte, interroge Ollama via le proxy Vite et reste
        centré sur l’analyse financière sans inventer de métriques.
      </p>
    </div>
  )
}
