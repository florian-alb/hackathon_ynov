import { PlusIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function NewChatButton({ onCreate }: { onCreate: () => void }) {
  return (
    <Button className="w-full justify-start" onClick={onCreate}>
      <PlusIcon />
      Nouveau chat
    </Button>
  )
}
