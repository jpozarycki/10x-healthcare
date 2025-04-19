"use client"

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay
} from '@/components/ui/alert-dialog'
import { XCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  className?: string
}

export function ErrorModal({
  isOpen,
  onClose,
  title = "Error",
  message,
  className,
}: ErrorModalProps) {
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
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive text-xl">
            <XCircle className="h-6 w-6" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 mt-2 text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <div className="w-full flex justify-end">
            <button 
              onClick={onClose}
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
              Close
            </button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Utility hook to manage error modal state
export function useErrorModal() {
  const [error, setError] = useState<{ isOpen: boolean; message: string; title?: string }>({
    isOpen: false,
    message: '',
    title: undefined,
  })

  const showError = (message: string, title?: string) => {
    setError({ isOpen: true, message, title })
  }

  const closeError = () => {
    setError({ ...error, isOpen: false })
  }

  return {
    error,
    showError,
    closeError,
  }
} 