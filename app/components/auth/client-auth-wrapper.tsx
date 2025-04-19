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
  
  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])
  
  if (isLoading) {
    return <div className="min-h-screen bg-background"></div>
  }
  
  return isAuthenticated ? children : <div className="min-h-screen bg-background"></div>
} 