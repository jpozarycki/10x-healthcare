import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay
} from "@/components/ui/alert-dialog";
import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  medicationId: string;
  medicationName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteModal({
  isOpen,
  medicationId,
  medicationName,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogOverlay className="backdrop-blur-sm transition-opacity duration-300 opacity-100" />
      <AlertDialogContent 
        className={cn(
          "bg-white shadow-xl rounded-xl",
          "border-2 border-destructive/20",
          "max-w-md mx-auto",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[state=open]:slide-in-from-center data-[state=closed]:slide-out-to-center",
          "duration-300 ease-in-out transition-all",
          "animate-in fade-in-0 zoom-in-95"
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive text-xl">
            <XCircle className="h-6 w-6 text-destructive" />
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 mt-2 text-base">
            This will permanently delete the medication "{medicationName}" and all
            associated schedule information. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <div className="w-full flex justify-between">
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded shadow-md hover:shadow-lg transition-all text-base cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded shadow-md hover:shadow-lg transition-all text-base cursor-pointer"
              style={{ 
                color: 'white', 
                display: 'block', 
                backgroundColor: '#ef4444',
                minWidth: '100px',
                textAlign: 'center',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 