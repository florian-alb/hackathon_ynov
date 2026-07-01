import type { PromptCategory, PromptTemplate } from "@/features/prompts/types"

export const PROMPT_CATEGORIES: PromptCategory[] = [
  "Analyse financière",
  "Risque",
  "Investissement",
  "Synthèse",
  "Audit",
  "Démo jury",
]

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: "ebitda-resultats",
    title: "EBITDA et résultats",
    description: "Clarifier les niveaux de performance pour un analyste junior.",
    category: "Analyse financière",
    prompt:
      "Explique clairement la différence entre EBITDA, résultat opérationnel et résultat net, avec un exemple simple.",
    tags: ["compte de résultat", "pédagogie"],
  },
  {
    id: "croissance-tresorerie-risque",
    title: "Croissance et cash",
    description: "Identifier les risques quand la croissance consomme la trésorerie.",
    category: "Risque",
    prompt:
      "Analyse les risques principaux d’une entreprise dont le chiffre d’affaires augmente mais dont la trésorerie diminue.",
    tags: ["cash", "croissance", "risque"],
  },
  {
    id: "note-comite-investissement",
    title: "Note comité",
    description: "Transformer des éléments bruts en note courte pour décision.",
    category: "Investissement",
    prompt:
      "Prépare une note courte pour un comité d’investissement à partir des éléments suivants : [coller les éléments].",
    tags: ["comité", "décision"],
  },
  {
    id: "obligation-entreprise",
    title: "Obligation d’entreprise",
    description: "Résumer les éléments utiles d’un instrument de dette.",
    category: "Analyse financière",
    prompt:
      "Résume les points clés d’une obligation d’entreprise pour un analyste financier junior.",
    tags: ["dette", "obligation"],
  },
  {
    id: "hausse-taux",
    title: "Exposition aux taux",
    description: "Évaluer les impacts financiers d’une hausse des taux.",
    category: "Risque",
    prompt:
      "Analyse l’exposition d’une entreprise à une hausse des taux d’intérêt.",
    tags: ["taux", "dette", "sensibilité"],
  },
  {
    id: "fraude-comptable",
    title: "Signaux faibles",
    description: "Repérer les indices possibles de manipulation comptable.",
    category: "Audit",
    prompt:
      "Identifie les signaux faibles pouvant indiquer une fraude ou une manipulation comptable.",
    tags: ["audit", "fraude", "contrôle"],
  },
  {
    id: "challenge-hypothese",
    title: "Challenge hypothèse",
    description: "Mettre sous pression une hypothèse business avant décision.",
    category: "Investissement",
    prompt: "Challenge cette hypothèse business : [coller l’hypothèse].",
    tags: ["hypothèse", "stratégie"],
  },
  {
    id: "executive-summary",
    title: "Executive summary",
    description: "Produire une synthèse lisible pour direction ou jury.",
    category: "Synthèse",
    prompt:
      "Crée une synthèse executive summary à partir de ces éléments : [coller les éléments].",
    tags: ["synthèse", "direction"],
  },
  {
    id: "baisse-marge-brute",
    title: "Marge brute",
    description: "Lister les causes plausibles d’une dégradation de marge.",
    category: "Analyse financière",
    prompt: "Explique les causes possibles d’une baisse de marge brute.",
    tags: ["marge", "prix", "coûts"],
  },
  {
    id: "bilan-simplifie",
    title: "Bilan simplifié",
    description: "Lire rapidement liquidité, dette et structure financière.",
    category: "Analyse financière",
    prompt:
      "Analyse rapidement un bilan simplifié à partir des données suivantes : [coller les données].",
    tags: ["bilan", "liquidité"],
  },
  {
    id: "due-diligence-pme",
    title: "Due diligence PME",
    description: "Construire une grille d’analyse financière opérationnelle.",
    category: "Audit",
    prompt:
      "Propose une grille de due diligence financière pour analyser une PME.",
    tags: ["due diligence", "PME"],
  },
  {
    id: "pitch-jury",
    title: "Pitch jury non technique",
    description: "Expliquer la valeur du modèle sans jargon technique.",
    category: "Démo jury",
    prompt:
      "Tu es le modèle financier TechCorp. Prépare une réponse claire pour un jury non technique expliquant comment tu aides un analyste financier.",
    tags: ["jury", "démo"],
  },
  {
    id: "cash-conversion",
    title: "Cash conversion",
    description: "Diagnostiquer l’écart entre profit comptable et cash réel.",
    category: "Risque",
    prompt:
      "Explique pourquoi une entreprise rentable peut manquer de trésorerie, puis propose trois vérifications prioritaires.",
    tags: ["cash", "BFR"],
  },
  {
    id: "memo-risques-credit",
    title: "Mémo risque crédit",
    description: "Préparer un format court pour revue de crédit.",
    category: "Synthèse",
    prompt:
      "Rédige un mémo de risque crédit en 6 points à partir des informations suivantes : [coller les informations].",
    tags: ["crédit", "synthèse"],
  },
]

export const FEATURED_PROMPTS = PROMPT_LIBRARY.slice(0, 6)
