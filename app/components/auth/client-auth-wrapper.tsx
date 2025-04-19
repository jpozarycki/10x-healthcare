"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StatusModal, useStatusModal } from '@/components/ui/status-modal'
import { useAuth } from '@/app/_components/auth-provider'

interface ClientAuthWrapperProps {
  children: React.ReactNode
}

export function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { status, showError, closeStatus } = useStatusModal()
  
  // Show error modal if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showError(
        "You need to be logged in to access this page", 
        "Authentication Required"
      )
    }
  }, [isLoading, isAuthenticated, showError])
  
  // Handle modal close and redirect
  const handleCloseModal = () => {
    closeStatus()
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }
  
  if (isLoading) {
    return <div className="min-h-screen bg-background"></div>
  }
  
  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div className="min-h-screen bg-background"></div>
      )}
      
      <StatusModal
        isOpen={status.isOpen && !isAuthenticated}
        onClose={handleCloseModal}
        title={status.title}
        message={status.message}
        variant="error"
      />
    </>
  )
} 