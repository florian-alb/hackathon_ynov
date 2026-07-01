import { useState, type ReactNode } from "react";
import {
  ChartLineUpIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  ScalesIcon,
} from "@phosphor-icons/react";

import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatMessageList } from "@/features/chat/components/ChatMessageList";
import { ChatSearch } from "@/features/chat/components/ChatSearch";
import { EmptyChatState } from "@/features/chat/components/EmptyChatState";
import type { ChatConversation } from "@/features/chat/types";

const HOME_SUGGESTIONS = [
  {
    icon: <ChartLineUpIcon />,
    title: "Différence EBITDA / résultat net",
    prompt:
      "Explique la différence entre EBITDA et résultat net avec un exemple simple.",
  },
  {
    icon: <MagnifyingGlassIcon />,
    title: "Risque de taux",
    prompt:
      "Analyse les risques d’un portefeuille très exposé aux taux d’intérêt.",
  },
  {
    icon: <ScalesIcon />,
    title: "Liquidité entreprise",
    prompt:
      "Quels signaux peuvent indiquer un problème de liquidité dans une entreprise ?",
  },
  {
    icon: <FileTextIcon />,
    title: "Note comité",
    prompt:
      "Aide-moi à préparer une note financière courte pour un comité d’investissement.",
  },
];

function SuggestionCard({
  children,
  icon,
  onClick,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      className="group min-h-[74px] rounded-lg border border-white/[0.09] bg-card/70 p-3 text-left transition-colors hover:border-emerald-300/35 hover:bg-emerald-300/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40"
      onClick={onClick}
    >
      <span className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-300/[0.1] text-emerald-100 transition-colors group-hover:bg-emerald-300/[0.16] [&_svg]:size-4">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-1 line-clamp-2 block text-sm leading-5 text-muted-foreground">
            {children}
          </span>
        </span>
      </span>
    </button>
  );
}

export function ChatView({
  activeConversation,
  activeModel,
  availableModelNames,
  chatError,
  chatSearchOpen,
  draft,
  isLoading,
  onChatSearchOpenChange,
  onDraftChange,
  onModelChange,
  onOpenPromptLibrary,
  onRetry,
  onSubmitPrompt,
  showRetry,
}: {
  activeConversation: ChatConversation | null;
  activeModel: string;
  availableModelNames: string[];
  chatError: string | null;
  chatSearchOpen: boolean;
  draft: string;
  isLoading: boolean;
  onChatSearchOpenChange: (open: boolean) => void;
  onDraftChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onOpenPromptLibrary: () => void;
  onRetry: () => void;
  onSubmitPrompt: (prompt: string) => void;
  showRetry: boolean;
}) {
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [selectedSearchMessageId, setSelectedSearchMessageId] = useState<
    string | null
  >(null);
  const messages = activeConversation?.messages ?? [];
  const showHome = messages.length === 0 && !isLoading && !chatError;

  const submitDraft = () => {
    const prompt = draft.trim();
    if (!prompt) return;
    onDraftChange("");
    onSubmitPrompt(prompt);
  };

  return (
    <div className="h-full min-h-0 bg-chat">
      <ChatSearch
        conversation={activeConversation}
        open={chatSearchOpen}
        onOpenChange={onChatSearchOpenChange}
        onQueryChange={setChatSearchQuery}
        onSelectedMessageChange={setSelectedSearchMessageId}
      />

      {showHome ? (
        <div className="h-full min-h-0 overflow-y-auto px-4">
          <div className="w-full">
            <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center py-5 lg:min-h-[calc(100dvh-4rem)]">
              <EmptyChatState />
              <div className="mt-5">
                <ChatComposer
                  draft={draft}
                  availableModelNames={availableModelNames}
                  isLoading={isLoading}
                  modelLabel={activeModel}
                  mode="home"
                  onChange={onDraftChange}
                  onModelChange={onModelChange}
                  onOpenPromptLibrary={onOpenPromptLibrary}
                  onSubmit={submitDraft}
                />
              </div>
              <div className="mx-auto mt-4 grid max-w-[820px] gap-3 sm:grid-cols-2">
                {HOME_SUGGESTIONS.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.title}
                    icon={suggestion.icon}
                    title={suggestion.title}
                    onClick={() => onDraftChange(suggestion.prompt)}
                  >
                    {suggestion.prompt}
                  </SuggestionCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">
          <ChatMessageList
            chatError={chatError}
            isLoading={isLoading}
            messages={messages}
            onRetry={onRetry}
            searchQuery={chatSearchQuery}
            selectedSearchMessageId={selectedSearchMessageId}
            showRetry={showRetry}
          />
          <ChatComposer
            draft={draft}
            availableModelNames={availableModelNames}
            isLoading={isLoading}
            modelLabel={activeModel}
            mode="thread"
            onChange={onDraftChange}
            onModelChange={onModelChange}
            onOpenPromptLibrary={onOpenPromptLibrary}
            onSubmit={submitDraft}
          />
        </div>
      )}
    </div>
  );
}
