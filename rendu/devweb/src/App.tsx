import {
  ArrowClockwiseIcon,
  ChartLineUpIcon,
  CommandIcon,
  ListIcon,
  PaperPlaneTiltIcon,
  PulseIcon,
  RobotIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DEFAULT_INFERENCE_OPTIONS,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  OLLAMA_DISPLAY_BASE_URL,
  OLLAMA_PROXY_CHAT_ENDPOINT,
  OLLAMA_PROXY_TAGS_ENDPOINT,
  buildChatPayload,
  checkOllamaConnection,
  normalizeOllamaError,
  sendOllamaChat,
  type InferenceOptions,
  type OllamaChatRequest,
  type OllamaChatResponse,
  type OllamaModelTag,
  type VisibleMessage,
} from "@/lib/ollama"
import { cn } from "@/lib/utils"

type ConnectionStatus = "checking" | "connected" | "disconnected"

type RunDetailsState = {
  state: "idle" | "running" | "success" | "error"
  endpoint: string
  model: string
  startedAt?: string
  durationMs?: number
  options: InferenceOptions
  promptMessages: number
  response?: OllamaChatResponse
  payload?: Pick<OllamaChatRequest, "model" | "stream" | "options"> & {
    messages: string
  }
  error?: string
}

const DEMO_PROMPTS = [
  "Explique la différence entre EBITDA et résultat net.",
  "Analyse les risques d’un portefeuille très exposé aux taux d’intérêt.",
  "Résume les points clés à vérifier avant un investissement obligataire.",
  "Aide-moi à préparer une note financière courte pour un comité d’investissement.",
  "Quels signaux peuvent indiquer un problème de liquidité dans une entreprise ?",
]

const INITIAL_RUN_DETAILS: RunDetailsState = {
  state: "idle",
  endpoint: OLLAMA_PROXY_CHAT_ENDPOINT,
  model: DEFAULT_MODEL,
  options: DEFAULT_INFERENCE_OPTIONS,
  promptMessages: 0,
}

function createMessage(
  role: VisibleMessage["role"],
  content: string,
): VisibleMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatDuration(durationMs?: number) {
  return typeof durationMs === "number" ? `${durationMs} ms` : "non fourni"
}

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("fr-FR") : "non fourni"
}

function App() {
  const reduceMotion = useReducedMotion()
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("checking")
  const [availableModels, setAvailableModels] = useState<OllamaModelTag[]>([])
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<VisibleMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null)
  const [mobilePanelsOpen, setMobilePanelsOpen] = useState(false)
  const [promptPaletteOpen, setPromptPaletteOpen] = useState(false)
  const [runDetails, setRunDetails] =
    useState<RunDetailsState>(INITIAL_RUN_DETAILS)

  const activeModel = model.trim() || DEFAULT_MODEL

  const modelNames = useMemo(
    () =>
      availableModels
        .map((entry) => entry.name || entry.model)
        .filter((name): name is string => Boolean(name)),
    [availableModels],
  )

  const activeModelAvailable = useMemo(() => {
    if (connectionStatus !== "connected" || modelNames.length === 0) {
      return true
    }

    return modelNames.some(
      (name) => name === activeModel || name?.startsWith(`${activeModel}:`),
    )
  }, [activeModel, connectionStatus, modelNames])

  const refreshConnection = useCallback(async (signal?: AbortSignal) => {
    setConnectionStatus("checking")
    setConnectionError(null)

    try {
      const models = await checkOllamaConnection(signal)
      setAvailableModels(models)
      setConnectionStatus("connected")
    } catch (cause) {
      if (signal?.aborted) {
        return
      }

      setAvailableModels([])
      setConnectionStatus("disconnected")
      setConnectionError(
        normalizeOllamaError(cause instanceof Error ? cause.message : ""),
      )
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refreshConnection(controller.signal)

    return () => controller.abort()
  }, [refreshConnection])

  const submitPrompt = useCallback(
    async (promptOverride?: string) => {
      const prompt = (promptOverride ?? draft).trim()

      if (!prompt || isLoading) {
        return
      }

      const userMessage = createMessage("user", prompt)
      const nextMessages = [...messages, userMessage]
      const payload = buildChatPayload(activeModel, nextMessages)
      const startedAt = new Date().toISOString()

      setMessages(nextMessages)
      setDraft("")
      setChatError(null)
      setLastFailedPrompt(null)
      setIsLoading(true)
      setRunDetails({
        state: "running",
        endpoint: OLLAMA_PROXY_CHAT_ENDPOINT,
        model: activeModel,
        startedAt,
        options: payload.options,
        promptMessages: payload.messages.length,
        payload: {
          model: payload.model,
          stream: payload.stream,
          options: payload.options,
          messages: `${payload.messages.length} messages, système inclus`,
        },
      })

      try {
        const result = await sendOllamaChat(payload)
        const assistantContent =
          result.content || "Réponse vide renvoyée par Ollama."
        const assistantMessage = createMessage("assistant", assistantContent)

        setMessages([...nextMessages, assistantMessage])
        setRunDetails((current) => ({
          ...current,
          state: "success",
          durationMs: result.durationMs,
          response: result.data,
        }))
        setConnectionStatus("connected")
      } catch (cause) {
        const message = normalizeOllamaError(
          cause instanceof Error ? cause.message : "",
        )

        setChatError(message)
        setLastFailedPrompt(prompt)
        setRunDetails((current) => ({
          ...current,
          state: "error",
          error: message,
        }))
        toast.error("Appel Ollama échoué", {
          description: message,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [activeModel, draft, isLoading, messages],
  )

  const clearConversation = useCallback(() => {
    setMessages([])
    setDraft("")
    setChatError(null)
    setLastFailedPrompt(null)
    setRunDetails({
      ...INITIAL_RUN_DETAILS,
      model: activeModel,
    })
  }, [activeModel])

  const retryLastPrompt = useCallback(() => {
    if (lastFailedPrompt) {
      void submitPrompt(lastFailedPrompt)
    }
  }, [lastFailedPrompt, submitPrompt])

  const selectPrompt = useCallback(
    (prompt: string) => {
      setDraft(prompt)
      setPromptPaletteOpen(false)
    },
    [setDraft],
  )

  const sidebar = (
    <ConnectionPanel
      activeModel={activeModel}
      activeModelAvailable={activeModelAvailable}
      availableModels={modelNames}
      connectionError={connectionError}
      connectionStatus={connectionStatus}
      model={model}
      onModelChange={setModel}
      onRefresh={() => void refreshConnection()}
      onSelectPrompt={(prompt) => void submitPrompt(prompt)}
    />
  )

  const details = <RunDetails details={runDetails} />

  return (
    <main className="h-[100dvh] min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <PromptCommand
        open={promptPaletteOpen}
        onOpenChange={setPromptPaletteOpen}
        onSelectPrompt={selectPrompt}
      />

      <Sheet open={mobilePanelsOpen} onOpenChange={setMobilePanelsOpen}>
        <SheetContent side="left" className="w-[92vw] max-w-md overflow-y-auto p-0">
          <SheetHeader className="border-b border-border/70 p-4">
            <SheetTitle>Contrôles TechCorp</SheetTitle>
            <Button variant="outline" size="sm" onClick={clearConversation}>
              <TrashIcon />
              Reset conversation
            </Button>
          </SheetHeader>
          <Tabs defaultValue="setup" className="p-4">
            <TabsList className="grid h-auto w-full grid-cols-2">
              <TabsTrigger value="setup">Ollama</TabsTrigger>
              <TabsTrigger value="run">Run</TabsTrigger>
            </TabsList>
            <TabsContent value="setup" className="pt-4">
              {sidebar}
            </TabsContent>
            <TabsContent value="run" className="pt-4">
              {details}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)]">
        <AppHeader
          activeModel={activeModel}
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          onClear={clearConversation}
          onOpenMobilePanels={() => setMobilePanelsOpen(true)}
          onOpenPromptPalette={() => setPromptPaletteOpen(true)}
        />

        <div className="grid min-h-0 gap-0 lg:grid-cols-[310px_minmax(0,1fr)_330px]">
          <aside className="hidden min-h-0 border-r border-border/70 p-4 lg:block">
            {sidebar}
          </aside>

          <section className="grid min-h-0 grid-rows-[1fr_auto]">
            <ConversationPanel
              error={chatError}
              isLoading={isLoading}
              messages={messages}
              onRetry={retryLastPrompt}
              onSelectPrompt={(prompt) => void submitPrompt(prompt)}
              reduceMotion={Boolean(reduceMotion)}
              showRetry={Boolean(lastFailedPrompt)}
            />

            <Composer
              draft={draft}
              isDisabled={connectionStatus === "checking"}
              isLoading={isLoading}
              onChange={setDraft}
              onOpenPromptPalette={() => setPromptPaletteOpen(true)}
              onSubmit={() => void submitPrompt()}
            />
          </section>

          <aside className="hidden min-h-0 border-l border-border/70 p-4 xl:block">
            {details}
          </aside>
        </div>
      </div>
    </main>
  )
}

function AppHeader({
  activeModel,
  connectionStatus,
  isLoading,
  onClear,
  onOpenMobilePanels,
  onOpenPromptPalette,
}: {
  activeModel: string
  connectionStatus: ConnectionStatus
  isLoading: boolean
  onClear: () => void
  onOpenMobilePanels: () => void
  onOpenPromptPalette: () => void
}) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-border/70 px-3 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className="lg:hidden"
          size="icon-sm"
          variant="outline"
          onClick={onOpenMobilePanels}
          aria-label="Ouvrir les panneaux"
        >
          <ListIcon />
        </Button>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
          <ChartLineUpIcon weight="duotone" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            TechCorp Industries
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            Financial AI Command Center
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <ConnectionBadge status={connectionStatus} />
        <Badge variant="outline" className="max-w-[220px] truncate font-mono">
          {activeModel}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <ConnectionBadge status={connectionStatus} compact />
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className="hidden sm:inline-flex"
                variant="outline"
                size="sm"
                onClick={onOpenPromptPalette}
              />
            }
          >
            <CommandIcon />
            <span className="hidden sm:inline">Prompts</span>
          </TooltipTrigger>
          <TooltipContent>Ouvrir les prompts de démonstration</TooltipContent>
        </Tooltip>
        <Button
          className="hidden sm:inline-flex"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={onClear}
        >
          <TrashIcon />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </header>
  )
}

function ConnectionPanel({
  activeModel,
  activeModelAvailable,
  availableModels,
  connectionError,
  connectionStatus,
  model,
  onModelChange,
  onRefresh,
  onSelectPrompt,
}: {
  activeModel: string
  activeModelAvailable: boolean
  availableModels: string[]
  connectionError: string | null
  connectionStatus: ConnectionStatus
  model: string
  onModelChange: (value: string) => void
  onRefresh: () => void
  onSelectPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <section className="rounded-xl border border-border/70 bg-card/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Connexion Ollama</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {OLLAMA_DISPLAY_BASE_URL}
            </p>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </div>

        <div className="mt-4 grid gap-2 font-mono text-xs">
          <DataLine label="Health" value={OLLAMA_PROXY_TAGS_ENDPOINT} />
          <DataLine label="Chat" value={OLLAMA_PROXY_CHAT_ENDPOINT} />
          <DataLine label="Fallback" value={FALLBACK_MODEL} />
        </div>

        <Button
          className="mt-4 w-full"
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          <ArrowClockwiseIcon />
          Vérifier
        </Button>

        {connectionError && (
          <Alert variant="destructive" className="mt-4">
            <WarningCircleIcon />
            <AlertTitle>Serveur indisponible</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
      </section>

      <section className="rounded-xl border border-border/70 bg-card/70 p-4">
        <label htmlFor="model" className="text-sm font-semibold">
          Modèle actif
        </label>
        <input
          id="model"
          className="mt-2 h-10 w-full rounded-lg border border-input bg-input/40 px-3 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          placeholder={DEFAULT_MODEL}
        />
        {!activeModelAvailable && (
          <p className="mt-2 text-xs text-amber-200">
            Modèle non listé dans Ollama. Créez {activeModel} ou testez {FALLBACK_MODEL}.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onModelChange(DEFAULT_MODEL)}
          >
            {DEFAULT_MODEL}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModelChange(FALLBACK_MODEL)}
          >
            {FALLBACK_MODEL}
          </Button>
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Modèles détectés
          </p>
          <p className="mt-1 break-words font-mono text-xs">
            {availableModels.length > 0 ? availableModels.join(", ") : "non fourni"}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border/70 bg-card/70 p-4">
        <p className="text-sm font-semibold">Prompts de démonstration</p>
        <div className="mt-3 flex flex-col gap-2">
          {DEMO_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              className="rounded-lg border border-border/70 bg-background/60 p-3 text-left text-sm leading-snug text-muted-foreground transition-colors hover:border-emerald-400/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:translate-y-px"
              type="button"
              onClick={() => onSelectPrompt(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function ConversationPanel({
  error,
  isLoading,
  messages,
  onRetry,
  onSelectPrompt,
  reduceMotion,
  showRetry,
}: {
  error: string | null
  isLoading: boolean
  messages: VisibleMessage[]
  onRetry: () => void
  onSelectPrompt: (prompt: string) => void
  reduceMotion: boolean
  showRetry: boolean
}) {
  return (
    <div className="min-h-0 px-3 py-4 sm:px-6">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="mx-auto w-full max-w-4xl pb-6">
              {messages.length === 0 && !isLoading ? (
                <EmptyConversation onSelectPrompt={onSelectPrompt} />
              ) : null}

              {messages.map((message) => (
                <MessageScrollerItem key={message.id}>
                  <ChatMessage message={message} reduceMotion={reduceMotion} />
                </MessageScrollerItem>
              ))}

              {isLoading && (
                <MessageScrollerItem scrollAnchor>
                  <AssistantLoading />
                </MessageScrollerItem>
              )}

              {error && (
                <MessageScrollerItem scrollAnchor>
                  <Alert variant="destructive" className="mx-auto max-w-3xl">
                    <WarningCircleIcon />
                    <AlertTitle>Erreur Ollama</AlertTitle>
                    <AlertDescription>
                      <span>{error}</span>
                      {showRetry && (
                        <Button
                          className="mt-3"
                          size="sm"
                          variant="outline"
                          onClick={onRetry}
                        >
                          <ArrowClockwiseIcon />
                          Réessayer
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  )
}

function EmptyConversation({
  onSelectPrompt,
}: {
  onSelectPrompt: (prompt: string) => void
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-start gap-5 py-5 sm:min-h-[56dvh] sm:justify-center sm:gap-6 sm:py-0">
      <div className="max-w-2xl">
        <Badge variant="secondary" className="font-mono">
          Démo jury prête
        </Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-normal text-foreground sm:text-4xl">
          Posez une question financière au modèle TechCorp.
        </h1>
        <p className="mt-3 max-w-[62ch] text-sm leading-6 text-muted-foreground sm:text-base">
          Le chat conserve le contexte, appelle Ollama via proxy Vite et affiche
          les détails du dernier run sans inventer de métriques.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {DEMO_PROMPTS.slice(0, 4).map((prompt, index) => (
          <button
            key={prompt}
            type="button"
            className={cn(
              "min-h-16 rounded-xl border border-border/70 bg-card/70 p-4 text-left text-sm leading-snug text-muted-foreground transition-colors hover:border-emerald-400/40 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 active:translate-y-px sm:min-h-20",
              index === 3 && "hidden sm:block",
            )}
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatMessage({
  message,
  reduceMotion,
}: {
  message: VisibleMessage
  reduceMotion: boolean
}) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Message align={isUser ? "end" : "start"}>
        <MessageAvatar
          className={cn(
            "size-8 rounded-lg border",
            isUser
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {isUser ? <PulseIcon weight="duotone" /> : <RobotIcon weight="duotone" />}
        </MessageAvatar>
        <MessageContent>
          <MessageHeader className="gap-2">
            <span>{isUser ? "Analyste" : "Phi-3.5 Financial"}</span>
            <span className="font-mono text-[11px]">{formatTime(message.createdAt)}</span>
          </MessageHeader>
          <Bubble
            variant={isUser ? "default" : "outline"}
            className={cn(isUser ? "max-w-[78%]" : "max-w-[92%]")}
          >
            <BubbleContent
              className={cn(
                "whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-6",
                isUser
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/70 bg-card text-card-foreground",
              )}
            >
              {message.content}
            </BubbleContent>
          </Bubble>
          <MessageFooter>
            {isUser ? "Question envoyée" : "Réponse modèle, à vérifier avant usage"}
          </MessageFooter>
        </MessageContent>
      </Message>
    </motion.div>
  )
}

function AssistantLoading() {
  return (
    <Message align="start">
      <MessageAvatar className="size-8 rounded-lg border border-border bg-muted text-muted-foreground">
        <RobotIcon weight="duotone" />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>Phi-3.5 Financial traite la demande</MessageHeader>
        <Bubble variant="outline" className="max-w-[92%]">
          <BubbleContent className="w-[min(680px,80vw)] rounded-xl border border-border/70 bg-card p-4">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function Composer({
  draft,
  isDisabled,
  isLoading,
  onChange,
  onOpenPromptPalette,
  onSubmit,
}: {
  draft: string
  isDisabled: boolean
  isLoading: boolean
  onChange: (value: string) => void
  onOpenPromptPalette: () => void
  onSubmit: () => void
}) {
  const canSubmit = draft.trim().length > 0 && !isLoading && !isDisabled

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canSubmit) {
      onSubmit()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (canSubmit) {
        onSubmit()
      }
    }
  }

  return (
    <form
      className="border-t border-border/70 bg-background/95 px-3 py-3 sm:px-6"
      onSubmit={handleSubmit}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-2 rounded-xl border border-input bg-card/80 p-2 shadow-[0_22px_80px_rgba(0,0,0,0.28)]">
        <Textarea
          className="min-h-24 resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 shadow-none focus-visible:ring-0"
          disabled={isLoading || isDisabled}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Demandez une analyse, un risque, une synthèse obligataire ou une note de comité..."
        />
        <div className="flex flex-col gap-2 border-t border-border/70 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenPromptPalette}
            >
              <CommandIcon />
              Prompts
            </Button>
            <span className="hidden sm:inline">Entrée envoie, Shift+Entrée ajoute une ligne</span>
          </div>
          <Button type="submit" disabled={!canSubmit} className="sm:min-w-32">
            <PaperPlaneTiltIcon weight="fill" />
            {isLoading ? "Analyse..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function RunDetails({ details }: { details: RunDetailsState }) {
  const response = details.response
  const payload = details.payload

  return (
    <section className="flex min-h-0 flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Run details</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Dernier appel au serveur d’inférence.
          </p>
        </div>
        <RunBadge state={details.state} />
      </div>

      <div className="grid gap-2 font-mono text-xs">
        <DataLine label="Endpoint" value={details.endpoint} />
        <DataLine label="Modèle" value={details.model} />
        <DataLine label="Durée" value={formatDuration(details.durationMs)} />
        <DataLine label="Temp." value={String(details.options.temperature)} />
        <DataLine label="Top p" value={String(details.options.top_p)} />
        <DataLine label="Tokens max" value={String(details.options.num_predict)} />
        <DataLine label="Messages" value={String(details.promptMessages)} />
        <DataLine label="Prompt eval" value={formatCount(response?.prompt_eval_count)} />
        <DataLine label="Eval" value={formatCount(response?.eval_count)} />
      </div>

      {details.error && (
        <Alert variant="destructive">
          <WarningCircleIcon />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{details.error}</AlertDescription>
        </Alert>
      )}

      <div className="min-h-0 rounded-lg border border-border/70 bg-background/70 p-3">
        <p className="text-xs font-medium text-muted-foreground">Payload compact</p>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-muted-foreground">
          {payload ? JSON.stringify(payload, null, 2) : "Aucun appel lancé."}
        </pre>
      </div>
    </section>
  )
}

function PromptCommand({
  open,
  onOpenChange,
  onSelectPrompt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPrompt: (prompt: string) => void
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Prompts de démonstration"
      description="Sélectionner une question financière de test"
      className="max-w-2xl border border-border bg-popover"
    >
      <CommandInput placeholder="Chercher un prompt..." />
      <CommandList>
        <CommandEmpty>Aucun prompt trouvé.</CommandEmpty>
        <CommandGroup heading="Finance">
          {DEMO_PROMPTS.map((prompt) => (
            <CommandItem
              key={prompt}
              value={prompt}
              onSelect={() => onSelectPrompt(prompt)}
            >
              <ChartLineUpIcon />
              <span>{prompt}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

function ConnectionBadge({
  compact = false,
  status,
}: {
  compact?: boolean
  status: ConnectionStatus
}) {
  const label =
    status === "connected"
      ? "Connecté"
      : status === "checking"
        ? "Vérification"
        : "Déconnecté"

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 font-mono",
        compact && "px-2 text-[11px]",
        status === "connected" && "border-emerald-400/30 text-emerald-200",
        status === "checking" && "border-amber-300/30 text-amber-100",
        status === "disconnected" && "border-red-300/30 text-red-100",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          status === "connected" && "bg-emerald-300",
          status === "checking" && "bg-amber-200",
          status === "disconnected" && "bg-red-300",
        )}
      />
      {label}
    </Badge>
  )
}

function RunBadge({ state }: { state: RunDetailsState["state"] }) {
  const label = {
    idle: "Idle",
    running: "Running",
    success: "OK",
    error: "Erreur",
  }[state]

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono",
        state === "running" && "border-amber-300/30 text-amber-100",
        state === "success" && "border-emerald-400/30 text-emerald-200",
        state === "error" && "border-red-300/30 text-red-100",
      )}
    >
      {label}
    </Badge>
  )
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-lg bg-muted/35 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right text-foreground" title={value}>
        {value}
      </span>
    </div>
  )
}

export default App
