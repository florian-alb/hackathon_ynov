import {
  BooksIcon,
  ChartLineUpIcon,
  CircleNotchIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/features/chat/components/ConversationList";
import { useChatSearch } from "@/features/chat/hooks/useChatSearch";
import type { ChatConversation, ConnectionStatus } from "@/features/chat/types";
import { cn } from "@/lib/utils";

function SidebarAction({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40"
      onClick={onClick}
    >
      <span className="flex size-5 shrink-0 items-center justify-center text-emerald-200/80 [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 px-2 text-xs font-semibold text-muted-foreground">
      {children}
    </p>
  );
}

function StatusDot({ status }: { status: ConnectionStatus }) {
  return (
    <span
      className={cn(
        "size-2 rounded-full",
        status === "connected" && "bg-emerald-300",
        status === "checking" && "bg-amber-300",
        status === "disconnected" && "bg-red-300",
      )}
    />
  );
}

export function Sidebar({
  activeConversationId,
  activeModel,
  connectionStatus,
  conversations,
  onClose,
  onCreateConversation,
  onDeleteConversation,
  onOpenPromptLibrary,
  onOpenSettings,
  onPinConversation,
  onRenameConversation,
  onSelectConversation,
}: {
  activeConversationId: string | null;
  activeModel: string;
  connectionStatus: ConnectionStatus;
  conversations: ChatConversation[];
  onClose?: () => void;
  onCreateConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onOpenPromptLibrary: () => void;
  onOpenSettings: () => void;
  onPinConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string) => void;
  onSelectConversation: (conversationId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const { filteredConversations } = useChatSearch(conversations, query);
  const pinnedConversations = filteredConversations.filter(
    (conversation) => conversation.pinned,
  );
  const regularConversations = filteredConversations.filter(
    (conversation) => !conversation.pinned,
  );
  const statusLabel =
    connectionStatus === "connected"
      ? "Connecté"
      : connectionStatus === "checking"
        ? "Vérification"
        : "Déconnecté";

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.08] bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 px-3 pb-3 pt-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40"
            onClick={onCreateConversation}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200">
              <ChartLineUpIcon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                TechCorp Industries
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Financial AI
              </span>
            </span>
          </button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Fermer la sidebar"
              onClick={onClose}
            >
              <SidebarSimpleIcon />
            </Button>
          )}
        </div>

        <Button
          type="button"
          className="h-10 w-full justify-start gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/[0.12] px-3 text-sm font-semibold text-emerald-50 hover:bg-emerald-300/[0.18]"
          onClick={onCreateConversation}
        >
          <PencilSimpleIcon className="size-4" />
          Nouveau chat
        </Button>

        <div className="relative mt-3">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 rounded-md border-white/[0.08] bg-white/[0.04] pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-300/40"
            placeholder="Rechercher"
          />
        </div>

        <div className="mt-4 grid gap-1">
          <SidebarAction icon={<BooksIcon />} onClick={onOpenPromptLibrary}>
            Bibliothèque de prompts
          </SidebarAction>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {pinnedConversations.length > 0 && (
          <>
            <SectionLabel>Épinglés</SectionLabel>
            <ConversationList
              activeConversationId={activeConversationId}
              conversations={pinnedConversations}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
              onRename={onRenameConversation}
              onSelect={onSelectConversation}
            />
          </>
        )}

        <SectionLabel>Conversations</SectionLabel>
        <ConversationList
          activeConversationId={activeConversationId}
          conversations={regularConversations}
          onDelete={onDeleteConversation}
          onPin={onPinConversation}
          onRename={onRenameConversation}
          onSelect={onSelectConversation}
        />
      </nav>

      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md border border-white/[0.08] bg-white/[0.04] p-3 text-left transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40"
          onClick={onOpenSettings}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-black/30 text-emerald-100">
            {connectionStatus === "checking" ? (
              <CircleNotchIcon className="size-5 animate-spin" />
            ) : (
              <StatusDot status={connectionStatus} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              Ollama {statusLabel}
            </span>
            <span className="block truncate font-mono text-xs text-muted-foreground">
              {activeModel}
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}
