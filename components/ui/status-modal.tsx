import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  variant: 'success' | 'error'
}

export function StatusModal({ isOpen, onClose, title, message, variant }: StatusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <span className={cn(
              variant === 'success' ? "text-green-700" : "text-destructive"
            )}>
              {title}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <div className="flex justify-end">
            <Button
              variant={variant === 'success' ? "default" : "destructive"}
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 