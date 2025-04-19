"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { StatusModal, useStatusModal } from '@/components/ui/status-modal'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
}

export function LogoutButton({ 
  variant = 'ghost',
  className
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { status, showSuccess, showError, closeStatus } = useStatusModal()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to log out')
      }

      // Show success modal
      showSuccess('You have been successfully logged out.', 'Logged Out')
      
      // Wait a moment before redirecting to let the user see the message
      setTimeout(() => {
        // Refresh the router cache to force revalidation
        router.refresh()
        
        // Redirect to login page
        router.push('/auth/login')
      }, 1500)
    } catch (error) {
      showError('An error occurred during logout. Please try again.', 'Error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const closeModal = () => {
    closeStatus()
    
    // If it was a successful logout, redirect after closing the modal
    if (status.variant === 'success') {
      router.refresh()
      router.push('/auth/login')
    }
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={handleLogout}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          "Logging out..."
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </>
        )}
      </Button>
      
      <StatusModal
        isOpen={status.isOpen}
        onClose={closeModal}
        title={status.title}
        message={status.message}
        variant={status.variant}
      />
    </>
  )
} 