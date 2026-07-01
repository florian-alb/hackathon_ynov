import {
  BooksIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { ChatHeader } from "@/components/layout/ChatHeader";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import type { ChatConversation, ConnectionStatus } from "@/features/chat/types";
import { cn } from "@/lib/utils";

function connectionLabel(status: ConnectionStatus) {
  if (status === "connected") return "Ollama connecté";
  if (status === "checking") return "Vérification Ollama";
  return "Ollama indisponible";
}

export function AppLayout({
  activeConversationId,
  activeModel,
  children,
  connectionStatus,
  conversations,
  desktopSidebarOpen,
  mobileSidebarOpen,
  onCreateConversation,
  onDeleteConversation,
  onDesktopSidebarOpenChange,
  onMobileSidebarOpenChange,
  onOpenChatSearch,
  onOpenPromptLibrary,
  onOpenSettings,
  onPinConversation,
  onRenameConversation,
  onSelectConversation,
  title,
}: {
  activeConversationId: string | null;
  activeModel: string;
  children: ReactNode;
  connectionStatus: ConnectionStatus;
  conversations: ChatConversation[];
  desktopSidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  onCreateConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onDesktopSidebarOpenChange: (open: boolean) => void;
  onMobileSidebarOpenChange: (open: boolean) => void;
  onOpenChatSearch: () => void;
  onOpenPromptLibrary: () => void;
  onOpenSettings: () => void;
  onPinConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string) => void;
  onSelectConversation: (conversationId: string) => void;
  title: string;
}) {
  const statusLabel = connectionLabel(connectionStatus);

  return (
    <div className="tech-shell relative h-[100dvh] min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <MobileSidebar
        activeConversationId={activeConversationId}
        activeModel={activeModel}
        connectionStatus={connectionStatus}
        conversations={conversations}
        onCreateConversation={onCreateConversation}
        onDeleteConversation={onDeleteConversation}
        onOpenChange={onMobileSidebarOpenChange}
        onOpenPromptLibrary={onOpenPromptLibrary}
        onOpenSettings={onOpenSettings}
        onPinConversation={onPinConversation}
        onRenameConversation={onRenameConversation}
        onSelectConversation={onSelectConversation}
        open={mobileSidebarOpen}
      />

      <div
        className={cn(
          "grid h-full min-h-0 grid-cols-1",
          desktopSidebarOpen && "lg:grid-cols-[304px_minmax(0,1fr)]",
        )}
      >
        {desktopSidebarOpen && (
          <div className="hidden min-h-0 lg:block">
            <Sidebar
              activeConversationId={activeConversationId}
              activeModel={activeModel}
              connectionStatus={connectionStatus}
              conversations={conversations}
              onClose={() => onDesktopSidebarOpenChange(false)}
              onCreateConversation={onCreateConversation}
              onDeleteConversation={onDeleteConversation}
              onOpenPromptLibrary={onOpenPromptLibrary}
              onOpenSettings={onOpenSettings}
              onPinConversation={onPinConversation}
              onRenameConversation={onRenameConversation}
              onSelectConversation={onSelectConversation}
            />
          </div>
        )}

        <main className="flex min-h-0 min-w-0 flex-col">
          <ChatHeader
            activeModel={activeModel}
            connectionStatus={connectionStatus}
            title={title}
            onOpenChatSearch={onOpenChatSearch}
            onOpenMobileSidebar={() => onMobileSidebarOpenChange(true)}
            onOpenPromptLibrary={onOpenPromptLibrary}
            onOpenSettings={onOpenSettings}
          />

          <header className="hidden h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-background/95 px-4 lg:flex">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                aria-label={
                  desktopSidebarOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"
                }
                onClick={() => onDesktopSidebarOpenChange(!desktopSidebarOpen)}
              >
                <SidebarSimpleIcon />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {title || "Nouvelle analyse financière"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Modèle local {activeModel}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "hidden h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium sm:inline-flex",
                  connectionStatus === "connected" &&
                    "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200",
                  connectionStatus === "checking" &&
                    "border-amber-400/20 bg-amber-400/[0.08] text-amber-200",
                  connectionStatus === "disconnected" &&
                    "border-red-400/20 bg-red-400/[0.08] text-red-200",
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {statusLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                aria-label="Rechercher dans le chat"
                onClick={onOpenChatSearch}
              >
                <MagnifyingGlassIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                aria-label="Ouvrir les prompts"
                onClick={onOpenPromptLibrary}
              >
                <BooksIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                aria-label="Ouvrir les paramètres"
                onClick={onOpenSettings}
              >
                <GearSixIcon />
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
