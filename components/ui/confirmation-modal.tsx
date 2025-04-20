"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay
} from '@/components/ui/alert-dialog'
import { XCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ConfirmationModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  title?: string
  message: string
  variant: 'warning' | 'error' | 'info'
  cancelText?: string
  confirmText?: string
  className?: string
}

export function ConfirmationModal({
  isOpen,
  onCancel,
  onConfirm,
  title = "Warning",
  message,
  variant = 'warning',
  cancelText = "Cancel",
  confirmText = "Confirm",
  className,
}: ConfirmationModalProps) {
  // Get appropriate icon based on variant
  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-destructive" />
      case 'info':
        return <AlertCircle className="h-6 w-6 text-blue-500" />
    }
  }
  
  // Get color schemes based on variant
  const getColors = () => {
    switch (variant) {
      case 'warning':
        return {
          border: 'border-amber-500/20',
          title: 'text-amber-700',
          confirmBtn: 'bg-amber-500 hover:bg-amber-600'
        }
      case 'error':
        return {
          border: 'border-destructive/20',
          title: 'text-destructive',
          confirmBtn: 'bg-destructive hover:bg-destructive/90'
        }
      case 'info':
        return {
          border: 'border-blue-500/20',
          title: 'text-blue-700',
          confirmBtn: 'bg-blue-500 hover:bg-blue-600'
        }
    }
  }

  const colors = getColors()

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogOverlay className="backdrop-blur-sm transition-opacity duration-300 opacity-100" />
      <AlertDialogContent 
        className={cn(
          "bg-white shadow-xl rounded-xl",
          "border-2", colors.border,
          "max-w-md mx-auto",
          "max-h-[90vh] overflow-y-auto",
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
          <AlertDialogTitle className={`flex items-center gap-2 ${colors.title} text-xl font-bold`}>
            {getIcon()}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 mt-3 text-base">
            <div dangerouslySetInnerHTML={{ __html: message }} className="mt-2" />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <div className="w-full flex justify-between gap-4">
            <button 
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded shadow-md hover:shadow-lg transition-all text-base cursor-pointer min-w-[120px]"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`${colors.confirmBtn} text-white font-bold py-3 px-6 rounded shadow-md hover:shadow-lg transition-all text-base cursor-pointer min-w-[160px]`}
            >
              {confirmText}
            </button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 