import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OllamaConnectionPanel } from "@/features/settings/components/OllamaConnectionPanel"
import { RunDetailsPanel } from "@/features/settings/components/RunDetailsPanel"
import type { ConnectionStatus, RunDetailsState } from "@/features/chat/types"

export function SettingsDialog({
  activeModel,
  activeModelAvailable,
  availableModelNames,
  connectionError,
  connectionStatus,
  model,
  onModelChange,
  onOpenChange,
  onRefreshConnection,
  open,
  runDetails,
}: {
  activeModel: string
  activeModelAvailable: boolean
  availableModelNames: string[]
  connectionError: string | null
  connectionStatus: ConnectionStatus
  model: string
  onModelChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onRefreshConnection: () => void
  open: boolean
  runDetails: RunDetailsState
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "o"
      ) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpenChange, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-white/10">
        <DialogHeader>
          <DialogTitle>Paramètres TechCorp AI</DialogTitle>
          <DialogDescription>
            Connexion Ollama, modèle actif et détails du dernier appel.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ollama">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ollama">Ollama</TabsTrigger>
            <TabsTrigger value="run">Run</TabsTrigger>
          </TabsList>
          <TabsContent value="ollama" className="mt-4">
            <OllamaConnectionPanel
              activeModel={activeModel}
              activeModelAvailable={activeModelAvailable}
              availableModelNames={availableModelNames}
              connectionError={connectionError}
              connectionStatus={connectionStatus}
              model={model}
              onModelChange={onModelChange}
              onRefresh={onRefreshConnection}
            />
          </TabsContent>
          <TabsContent value="run" className="mt-4">
            <RunDetailsPanel details={runDetails} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
