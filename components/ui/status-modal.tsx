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
import { XCircle, CheckCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  variant: 'success' | 'error'
  className?: string
}

export function StatusModal({
  isOpen,
  onClose,
  title = "Error",
  message,
  variant = 'error',
  className,
}: StatusModalProps) {
  const icon = variant === 'success' ? (
    <CheckCircle className="h-6 w-6 text-green-500" />
  ) : (
    <XCircle className="h-6 w-6 text-destructive" />
  )
  
  const titleText = title || (variant === 'success' ? 'Success' : 'Error')
  const buttonColor = variant === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
  const borderColor = variant === 'success' ? 'border-green-500/20' : 'border-destructive/20'
  const titleColor = variant === 'success' ? 'text-green-700' : 'text-destructive'

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogOverlay className="backdrop-blur-sm transition-opacity duration-300 opacity-100" />
      <AlertDialogContent 
        className={cn(
          "bg-white shadow-xl rounded-xl",
          "border-2", borderColor,
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
          <AlertDialogTitle className={`flex items-center gap-2 ${titleColor} text-xl`}>
            {icon}
            {titleText}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 mt-2 text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <div className="w-full flex justify-end">
            <button 
              onClick={onClose}
              className={`${buttonColor} text-white font-bold py-2 px-6 rounded shadow-md hover:shadow-lg transition-all text-base cursor-pointer`}
              style={{ 
                color: 'white', 
                display: 'block', 
                backgroundColor: variant === 'success' ? '#22c55e' : '#ef4444',
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

// Utility hook to manage status modal state
export function useStatusModal() {
  const [status, setStatus] = useState<{ 
    isOpen: boolean; 
    message: string; 
    title?: string;
    variant: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    title: undefined,
    variant: 'error'
  })

  const showStatus = (message: string, options?: { title?: string, variant?: 'success' | 'error' }) => {
    setStatus({ 
      isOpen: true, 
      message, 
      title: options?.title,
      variant: options?.variant || 'error'
    })
  }

  const showError = (message: string, title?: string) => {
    setStatus({ isOpen: true, message, title, variant: 'error' })
  }

  const showSuccess = (message: string, title?: string) => {
    setStatus({ isOpen: true, message, title, variant: 'success' })
  }

  const closeStatus = () => {
    setStatus({ ...status, isOpen: false })
  }

  return {
    status,
    showStatus,
    showError,
    showSuccess,
    closeStatus,
  }
} 