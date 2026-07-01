# Mission Codex — Refactor complet du frontend en clone ChatGPT local-first

## 1. Rôle

Tu es un ingénieur frontend senior spécialisé en :

- React ;
- TypeScript ;
- Vite ;
- Tailwind CSS ;
- architecture frontend maintenable ;
- design system ;
- UX de chat type ChatGPT ;
- refactorisation progressive sans casser l’existant.

Tu travailles dans le repository suivant :

```txt
florian-alb/hackathon_ynov
````

Le frontend concerné se trouve ici :

```txt
rendu/devweb/
```

Ton objectif est de refactoriser complètement le frontend existant pour créer une interface moderne de chat type ChatGPT, adaptée au projet scolaire TechCorp Financial AI.

---

## 2. Objectif final

Transformer le frontend actuel en une application de chat professionnelle, locale, responsive et démontrable devant un jury.

L’interface doit ressembler à un clone propre de ChatGPT avec :

* une sidebar gauche ;
* un bouton `Nouveau chat` ;
* un historique des conversations ;
* une recherche globale dans les conversations ;
* une recherche dans le chat actif ;
* une bibliothèque de prompts ;
* une zone centrale de chat ;
* un composer sticky en bas ;
* la persistance des conversations dans le `localStorage` ;
* la connexion au modèle Ollama existant ;
* un panneau de paramètres pour Ollama, le modèle actif et les détails d’exécution.

L’application doit rester simple, robuste et maintenable.

---

## 3. Contexte technique existant

Le projet utilise déjà :

* React ;
* Vite ;
* TypeScript ;
* Tailwind CSS ;
* shadcn/ui ;
* cmdk ;
* sonner ;
* motion ;
* Phosphor Icons ;
* l’alias `@` vers `src`.

Le frontend est dans :

```txt
rendu/devweb/
```

Il existe déjà une intégration Ollama dans :

```txt
src/lib/ollama.ts
```

Tu dois conserver et réutiliser cette logique.

Ne casse pas les fonctions existantes suivantes si elles existent déjà :

* `buildChatPayload`;
* `sendOllamaChat`;
* `checkOllamaConnection`;
* `normalizeOllamaError`.

Les endpoints existants doivent rester :

```txt
/api/chat
/api/tags
```

Le modèle par défaut doit rester :

```txt
techcorp-financial
```

Le modèle fallback doit rester :

```txt
phi3.5
```

---

## 4. Problème à résoudre

Le frontend actuel est trop centralisé, notamment dans `src/App.tsx`.

Le fichier mélange actuellement :

* layout ;
* état global ;
* logique de chat ;
* appels Ollama ;
* gestion des erreurs ;
* affichage des messages ;
* connexion Ollama ;
* détails du run ;
* prompts ;
* responsive ;
* styles.

Tu dois refactoriser en fichiers propres, avec une séparation claire entre :

* composants UI ;
* hooks métier ;
* services ;
* types ;
* données statiques ;
* intégration Ollama.

`App.tsx` doit devenir très court.

---

## 5. Contraintes strictes

Respecte impérativement ces contraintes :

* ne modifie pas le backend ;
* ne modifie pas le serveur Ollama ;
* ne change pas Vite ;
* ne remplace pas React ;
* n’ajoute pas Redux ;
* n’ajoute pas Zustand ;
* n’ajoute pas de base de données ;
* n’ajoute pas d’authentification ;
* n’ajoute pas de dépendance lourde inutile ;
* ne hardcode pas d’URL externe ;
* ne stocke aucun secret ;
* ne casse pas `npm run dev` ;
* ne casse pas `npm run build` ;
* ne supprime pas les composants shadcn existants s’ils sont réutilisables ;
* ne touche pas aux dossiers IA, infra, cyber, datasets, models ou autres parties non frontend ;
* garde la persistance uniquement en `localStorage` ;
* garde le contexte complet de conversation envoyé à Ollama ;
* ne fabrique pas de fausses métriques modèle ;
* ne masque pas les erreurs Ollama.

---

## 6. Architecture cible

Refactorise vers une structure proche de celle-ci :

```txt
src/
  App.tsx
  main.tsx
  index.css

  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      MobileSidebar.tsx
      ChatHeader.tsx

    ui/
      ... composants shadcn existants ...

  features/
    chat/
      components/
        ChatView.tsx
        ChatMessageList.tsx
        ChatMessageItem.tsx
        ChatComposer.tsx
        EmptyChatState.tsx
        ConversationList.tsx
        ConversationListItem.tsx
        ChatSearch.tsx
        NewChatButton.tsx

      hooks/
        useChatStore.ts
        useChatSearch.ts
        useOllamaChat.ts

      services/
        chat-storage.ts
        chat-title.ts

      types.ts

    prompts/
      components/
        PromptLibraryDialog.tsx
        PromptCategoryTabs.tsx
        PromptCard.tsx

      data/
        prompt-library.ts

      types.ts

    settings/
      components/
        SettingsDialog.tsx
        OllamaConnectionPanel.tsx
        RunDetailsPanel.tsx

  lib/
    ollama.ts
    utils.ts
```

Cette structure peut être légèrement adaptée si nécessaire, mais le principe doit rester le même :

* petits composants ;
* hooks dédiés ;
* services dédiés ;
* types dédiés ;
* pas de fichier géant.

---

## 7. Types métier attendus

Créer les types suivants dans :

```txt
src/features/chat/types.ts
```

```ts
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model: string;
  pinned?: boolean;
};
```

Créer aussi, si utile :

```ts
export type ConnectionStatus = "checking" | "connected" | "disconnected" | "error";

export type ChatSearchResult = {
  conversationId: string;
  messageId?: string;
  title: string;
  excerpt: string;
};
```

---

## 8. Persistance localStorage

Créer un service dédié :

```txt
src/features/chat/services/chat-storage.ts
```

Utiliser les clés suivantes :

```ts
const STORAGE_KEY = "techcorp.chat.conversations.v1";
const ACTIVE_CHAT_KEY = "techcorp.chat.activeConversationId.v1";
```

Le service doit gérer :

* lecture des conversations ;
* écriture des conversations ;
* lecture du chat actif ;
* écriture du chat actif ;
* validation minimale ;
* fallback si le storage est vide ;
* fallback si le storage est corrompu ;
* migration simple si la structure change plus tard ;
* protection contre les erreurs `JSON.parse`;
* protection contre les erreurs `localStorage`.

Comportement attendu :

* au premier lancement, créer une conversation vide ;
* après refresh, conserver les conversations ;
* après refresh, conserver le chat actif ;
* si le `localStorage` est corrompu, ne jamais faire planter React ;
* si une conversation est invalide, essayer de récupérer les conversations valides ;
* afficher un toast d’avertissement si la récupération échoue.

Exemple de style défensif attendu :

```ts
try {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isValidConversation);
} catch {
  return [];
}
```

---

## 9. Génération du titre de chat

Créer :

```txt
src/features/chat/services/chat-title.ts
```

Règles :

* générer le titre à partir du premier message utilisateur ;
* retirer les retours à la ligne ;
* trim ;
* limiter à environ 50 caractères ;
* ajouter `...` si le texte est coupé ;
* fallback : `Nouveau chat`.

Exemple :

```ts
export function generateConversationTitle(input: string): string {
  const normalized = input.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "Nouveau chat";
  }

  if (normalized.length <= 50) {
    return normalized;
  }

  return `${normalized.slice(0, 50).trim()}...`;
}
```

---

## 10. Hook principal de chat

Créer :

```txt
src/features/chat/hooks/useChatStore.ts
```

Ce hook doit gérer :

* `conversations`;
* `activeConversationId`;
* `activeConversation`;
* `createConversation`;
* `selectConversation`;
* `deleteConversation`;
* `renameConversation`;
* `clearAllConversations`;
* `appendMessage`;
* `updateConversation`;
* `pinConversation`, si simple ;
* sauvegarde automatique dans le `localStorage`.

Règles importantes :

* la liste des conversations doit être triée par `updatedAt` décroissant ;
* le chat actif doit être stable après refresh ;
* si le chat actif est supprimé, sélectionner une autre conversation ;
* si toutes les conversations sont supprimées, recréer une conversation vide ;
* `updatedAt` doit être mis à jour à chaque ajout de message ;
* le premier message utilisateur doit renommer automatiquement le chat si le titre est encore `Nouveau chat`.

Ne mets pas la logique Ollama dans ce hook.

---

## 11. Hook Ollama

Créer :

```txt
src/features/chat/hooks/useOllamaChat.ts
```

Ce hook doit gérer :

* `isLoading`;
* `chatError`;
* `lastFailedPrompt`;
* `runDetails`;
* `connectionStatus`;
* `availableModels`;
* `model`;
* `setModel`;
* `refreshConnection`;
* `submitPrompt`;
* `retryLastPrompt`.

Il doit réutiliser :

```txt
src/lib/ollama.ts
```

Le comportement d’envoi doit être exactement celui-ci :

1. récupérer le chat actif ;
2. créer un message utilisateur ;
3. l’ajouter immédiatement dans la conversation ;
4. construire le payload avec tout l’historique du chat ;
5. appeler `sendOllamaChat`;
6. créer un message assistant avec la réponse reçue ;
7. l’ajouter dans la même conversation ;
8. sauvegarder automatiquement via le store ;
9. mettre à jour les détails du run ;
10. afficher une erreur claire si l’appel échoue ;
11. permettre de réessayer le dernier prompt échoué.

Pendant l’appel :

* bloquer l’envoi multiple ;
* garder le message utilisateur visible ;
* afficher un état loading ;
* ne pas perdre le chat actif ;
* rattacher la réponse au bon chat, même si l’utilisateur change de conversation pendant l’appel.

Très important : la réponse assistant doit toujours être ajoutée à la conversation qui a déclenché l’appel, pas forcément à celle actuellement affichée si l’utilisateur a changé de chat entre-temps.

---

## 12. Recherche globale dans les conversations

Créer :

```txt
src/features/chat/hooks/useChatSearch.ts
```

La recherche globale doit :

* chercher dans les titres des conversations ;
* chercher dans le contenu des messages ;
* être insensible à la casse ;
* filtrer la liste dans la sidebar ;
* afficher un état vide si aucun résultat ;
* ne pas modifier les conversations ;
* ne pas faire d’appel backend.

Critères :

* si la recherche est vide, afficher toutes les conversations ;
* si un message correspond, afficher la conversation ;
* afficher un petit extrait du message trouvé si possible.

---

## 13. Recherche dans le chat actif

Créer un composant :

```txt
src/features/chat/components/ChatSearch.tsx
```

Fonctionnalités :

* bouton dans le header pour ouvrir la recherche ;
* champ de recherche ;
* nombre de résultats ;
* navigation résultat précédent / suivant si simple ;
* surlignage discret des messages correspondants ;
* scroll vers le message sélectionné si simple.

La recherche doit rester client-side.

---

## 14. Sidebar gauche

Créer :

```txt
src/components/layout/Sidebar.tsx
```

La sidebar doit contenir :

* logo / nom : `TechCorp AI`;
* bouton `+ Nouveau chat`;
* champ de recherche global ;
* bouton `Bibliothèque de prompts`;
* liste des conversations ;
* statut Ollama ;
* modèle actif ;
* bouton `Paramètres`.

Chaque conversation doit afficher :

* titre ;
* aperçu du dernier message ;
* date courte ou relative ;
* nombre de messages si simple ;
* état actif ;
* menu d’actions : renommer, supprimer ;
* option épingler si simple.

Règles UX :

* conversation active visuellement marquée ;
* conversations triées par `updatedAt` décroissant ;
* suppression avec confirmation ;
* état vide propre ;
* sidebar scrollable ;
* aucune action destructive sans confirmation.

---

## 15. Mobile sidebar

Créer :

```txt
src/components/layout/MobileSidebar.tsx
```

Sur mobile :

* masquer la sidebar desktop ;
* afficher un bouton menu ;
* ouvrir un drawer/sheet ou panneau latéral ;
* conserver les mêmes actions principales ;
* ne pas gêner l’utilisation du chat ;
* garder le composer accessible.

---

## 16. Chat central

Créer :

```txt
src/features/chat/components/ChatView.tsx
```

Le chat central doit contenir :

* header ;
* titre de conversation ;
* modèle actif ;
* statut Ollama ;
* bouton recherche dans le chat ;
* liste de messages ;
* état vide ;
* composer sticky en bas.

Le layout doit être proche de ChatGPT :

```txt
Header conversation
────────────────────────────────
Messages scrollables
────────────────────────────────
Composer sticky
```

---

## 17. Header de conversation

Créer :

```txt
src/components/layout/ChatHeader.tsx
```

Le header doit afficher :

* titre du chat actif ;
* modèle actif ;
* statut Ollama ;
* bouton recherche ;
* bouton bibliothèque de prompts ;
* bouton paramètres ;
* bouton menu mobile.

Il doit rester sobre et professionnel.

---

## 18. Liste de messages

Créer :

```txt
src/features/chat/components/ChatMessageList.tsx
src/features/chat/components/ChatMessageItem.tsx
```

Chaque message doit afficher :

* rôle user ou assistant ;
* contenu avec `white-space: pre-wrap`;
* heure courte ;
* style distinct pour user et assistant ;
* bouton copier pour les réponses assistant ;
* indication discrète pour les réponses assistant :

```txt
Réponse générée par IA — à vérifier avant usage.
```

Pendant le chargement :

* afficher une bulle assistant en cours ;
* utiliser une animation légère ;
* ne pas faire clignoter toute la page.

---

## 19. Composer

Créer :

```txt
src/features/chat/components/ChatComposer.tsx
```

Fonctionnalités :

* textarea ;
* placeholder clair ;
* bouton envoyer ;
* bouton bibliothèque de prompts ;
* `Enter` pour envoyer ;
* `Shift + Enter` pour nouvelle ligne ;
* désactiver l’envoi si vide ;
* désactiver l’envoi pendant chargement ;
* hauteur auto si simple ;
* composer sticky en bas.

Placeholder recommandé :

```txt
Posez une question financière à TechCorp AI...
```

---

## 20. État vide

Créer :

```txt
src/features/chat/components/EmptyChatState.tsx
```

Quand le chat actif n’a aucun message, afficher :

* titre de bienvenue ;
* courte explication ;
* 4 à 6 suggestions de prompts ;
* bouton pour ouvrir la bibliothèque complète.

Exemple de titre :

```txt
Comment puis-je vous aider dans votre analyse financière ?
```

---

## 21. Bibliothèque de prompts

Créer les fichiers :

```txt
src/features/prompts/types.ts
src/features/prompts/data/prompt-library.ts
src/features/prompts/components/PromptLibraryDialog.tsx
src/features/prompts/components/PromptCategoryTabs.tsx
src/features/prompts/components/PromptCard.tsx
```

Types attendus :

```ts
export type PromptCategory =
  | "Analyse financière"
  | "Risque"
  | "Investissement"
  | "Synthèse"
  | "Audit"
  | "Démo jury";

export type PromptTemplate = {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  prompt: string;
  tags: string[];
};
```

Créer au moins 12 prompts utiles au projet TechCorp.

Prompts obligatoires à inclure :

```txt
Explique clairement la différence entre EBITDA, résultat opérationnel et résultat net, avec un exemple simple.
```

```txt
Analyse les risques principaux d’une entreprise dont le chiffre d’affaires augmente mais dont la trésorerie diminue.
```

```txt
Prépare une note courte pour un comité d’investissement à partir des éléments suivants : [coller les éléments].
```

```txt
Résume les points clés d’une obligation d’entreprise pour un analyste financier junior.
```

```txt
Analyse l’exposition d’une entreprise à une hausse des taux d’intérêt.
```

```txt
Identifie les signaux faibles pouvant indiquer une fraude ou une manipulation comptable.
```

```txt
Challenge cette hypothèse business : [coller l’hypothèse].
```

```txt
Crée une synthèse executive summary à partir de ces éléments : [coller les éléments].
```

```txt
Explique les causes possibles d’une baisse de marge brute.
```

```txt
Analyse rapidement un bilan simplifié à partir des données suivantes : [coller les données].
```

```txt
Propose une grille de due diligence financière pour analyser une PME.
```

```txt
Tu es le modèle financier TechCorp. Prépare une réponse claire pour un jury non technique expliquant comment tu aides un analyste financier.
```

UI attendue :

* modal ou command palette avec `cmdk` ;
* recherche dans les prompts ;
* filtre par catégorie ;
* carte par prompt ;
* bouton `Insérer`;
* bouton `Envoyer directement` si simple ;
* raccourci `Cmd/Ctrl + K` pour ouvrir la bibliothèque si simple.

---

## 22. Paramètres et connexion Ollama

Créer :

```txt
src/features/settings/components/SettingsDialog.tsx
src/features/settings/components/OllamaConnectionPanel.tsx
src/features/settings/components/RunDetailsPanel.tsx
```

Le panneau paramètres doit permettre :

* voir l’état de connexion Ollama ;
* relancer la vérification ;
* afficher les modèles disponibles ;
* changer le modèle actif ;
* revenir rapidement à `techcorp-financial`;
* revenir rapidement à `phi3.5`;
* afficher les derniers détails du run.

Les détails du run doivent être déplacés hors du chat central.

Garder uniquement les données réellement disponibles :

* endpoint ;
* modèle ;
* durée ;
* température ;
* top_p ;
* tokens max ;
* nombre de messages ;
* `prompt_eval_count` ;
* `eval_count`.

Ne pas inventer de données.

---

## 23. Design attendu

Créer un design sombre, premium et sobre, proche ChatGPT.

Direction artistique :

* fond général très sombre ;
* sidebar légèrement contrastée ;
* bordures discrètes ;
* radius généreux ;
* typographie propre ;
* composer large ;
* messages lisibles ;
* hiérarchie claire ;
* animations légères ;
* pas de surcharge visuelle ;
* pas d’effet gadget.

Le design doit donner une impression de produit fini pour une démo d’école.

L’interface doit être responsive :

* desktop agréable ;
* tablette correcte ;
* mobile utilisable.

---

## 24. Accessibilité

Prévoir :

* `aria-label` sur les boutons icônes ;
* labels accessibles ;
* focus visible ;
* navigation clavier basique ;
* contraste suffisant ;
* boutons désactivés quand une action est impossible ;
* confirmation avant suppression ;
* toasts pour erreurs et succès importants ;
* respect de `prefers-reduced-motion` si animation.

---

## 25. Gestion des erreurs

Les erreurs doivent être visibles, claires et non bloquantes.

Cas à gérer :

* Ollama indisponible ;
* modèle indisponible ;
* erreur réseau ;
* réponse vide ;
* localStorage corrompu ;
* conversation supprimée pendant une action ;
* tentative d’envoi d’un message vide ;
* erreur pendant la copie dans le presse-papiers.

Ne jamais faire planter toute l’application pour une erreur récupérable.

---

## 26. Workflow d’implémentation obligatoire

Procède dans cet ordre.

### Étape 1 — Audit rapide

Inspecte :

```txt
src/App.tsx
src/lib/ollama.ts
src/index.css
src/components/ui
package.json
```

Identifie :

* les composants réutilisables ;
* les types existants ;
* les fonctions Ollama existantes ;
* les styles existants ;
* les dépendances disponibles.

Ne commence pas par tout supprimer.

---

### Étape 2 — Types et services

Créer ou compléter :

```txt
src/features/chat/types.ts
src/features/chat/services/chat-storage.ts
src/features/chat/services/chat-title.ts
src/features/prompts/types.ts
src/features/prompts/data/prompt-library.ts
```

Valide TypeScript après cette étape.

---

### Étape 3 — Hooks

Créer :

```txt
src/features/chat/hooks/useChatStore.ts
src/features/chat/hooks/useChatSearch.ts
src/features/chat/hooks/useOllamaChat.ts
```

La logique métier doit être ici, pas dans les gros composants.

---

### Étape 4 — Layout

Créer :

```txt
src/components/layout/AppLayout.tsx
src/components/layout/Sidebar.tsx
src/components/layout/MobileSidebar.tsx
src/components/layout/ChatHeader.tsx
```

---

### Étape 5 — Composants chat

Créer :

```txt
src/features/chat/components/ChatView.tsx
src/features/chat/components/ChatMessageList.tsx
src/features/chat/components/ChatMessageItem.tsx
src/features/chat/components/ChatComposer.tsx
src/features/chat/components/EmptyChatState.tsx
src/features/chat/components/ConversationList.tsx
src/features/chat/components/ConversationListItem.tsx
src/features/chat/components/ChatSearch.tsx
src/features/chat/components/NewChatButton.tsx
```

---

### Étape 6 — Prompts

Créer :

```txt
src/features/prompts/components/PromptLibraryDialog.tsx
src/features/prompts/components/PromptCategoryTabs.tsx
src/features/prompts/components/PromptCard.tsx
```

Brancher la bibliothèque au composer et à la sidebar.

---

### Étape 7 — Settings

Créer :

```txt
src/features/settings/components/SettingsDialog.tsx
src/features/settings/components/OllamaConnectionPanel.tsx
src/features/settings/components/RunDetailsPanel.tsx
```

Brancher les paramètres au header ou à la sidebar.

---

### Étape 8 — App finale

Réécrire `src/App.tsx` pour qu’il soit court.

Il doit principalement :

* initialiser les hooks ;
* connecter les composants principaux ;
* afficher le layout ;
* passer les callbacks nécessaires.

Ne laisse pas `App.tsx` redevenir un fichier géant.

---

### Étape 9 — Validation

Exécuter :

```bash
npm run build
```

Si disponible, exécuter aussi :

```bash
npm run lint
```

Corriger toutes les erreurs bloquantes.

---

## 27. Critères d’acceptation

Le refactor est terminé uniquement si :

* l’application démarre avec `npm run dev` ;
* le build passe avec `npm run build` ;
* l’interface ressemble à un clone ChatGPT ;
* la sidebar gauche fonctionne ;
* on peut créer un nouveau chat ;
* on peut sélectionner un ancien chat ;
* on peut renommer un chat ;
* on peut supprimer un chat ;
* les conversations sont sauvegardées dans le `localStorage` ;
* les conversations restent après refresh ;
* le chat actif reste après refresh ;
* la recherche globale fonctionne ;
* la recherche dans le chat actif fonctionne ;
* la bibliothèque de prompts fonctionne ;
* un prompt peut être inséré dans le composer ;
* un prompt peut être envoyé à Ollama ;
* la réponse assistant est ajoutée au bon chat ;
* les erreurs Ollama sont affichées proprement ;
* le modèle actif est visible ;
* le modèle actif peut être changé ;
* les détails du dernier run sont accessibles ;
* l’interface est responsive ;
* `App.tsx` est fortement réduit ;
* le code est réparti dans des fichiers maintenables.

---

## 28. Bonus autorisés

Ajoute ces bonus uniquement s’ils ne complexifient pas trop le code :

* copier un message assistant ;
* épingler une conversation ;
* exporter une conversation en JSON ;
* dupliquer une conversation ;
* compteur de messages ;
* regroupement des conversations par date :

  * Aujourd’hui ;
  * Hier ;
  * 7 derniers jours ;
  * Plus ancien.
* raccourci `Cmd/Ctrl + K` pour les prompts ;
* raccourci `Cmd/Ctrl + Shift + O` pour les paramètres.

Ces bonus ne doivent jamais casser le build.

---

## 29. Qualité de code attendue

Respecte ces règles :

* TypeScript propre ;
* pas de `any` inutile ;
* composants courts ;
* hooks spécialisés ;
* services purs ;
* noms explicites ;
* logique métier séparée de l’UI ;
* pas de duplication inutile ;
* pas de `console.log` final ;
* pas de code mort ;
* imports propres ;
* pas de fichier massif ;
* pas de changement hors périmètre.

---

## 30. Stratégie d’exécution recommandée

Travaille de manière incrémentale.

Pour chaque grande étape :

1. créer les fichiers nécessaires ;
2. brancher progressivement ;
3. vérifier les imports ;
4. vérifier TypeScript ;
5. garder l’application fonctionnelle.

Ne fais pas une refonte destructrice d’un seul coup si ce n’est pas nécessaire.

Préserve les parties fonctionnelles existantes, surtout l’intégration Ollama.

---

## 31. Format de réponse final attendu

À la fin, fournis un compte rendu clair avec :

```txt
Résumé des modifications
Fichiers créés
Fichiers modifiés
Commandes exécutées
Résultat du build
Fonctionnalités implémentées
Limites éventuelles
```

Ne donne pas seulement une explication : applique réellement les modifications dans le code.

---

## 32. Instruction finale

Commence maintenant.

Refactorise uniquement le frontend dans :

```txt
rendu/devweb/
```

Crée une interface ChatGPT-like propre, moderne, maintenable, sauvegardée en localStorage, avec historique, recherche, bibliothèque de prompts et intégration Ollama fonctionnelle.