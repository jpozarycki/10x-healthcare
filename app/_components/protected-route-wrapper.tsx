"use client"

import { usePathname } from 'next/navigation'
import { ClientAuthWrapper } from '@/app/components/auth/client-auth-wrapper'

interface ProtectedRouteWrapperProps {
  children: React.ReactNode
}

export function ProtectedRouteWrapper({ children }: ProtectedRouteWrapperProps) {
  const pathname = usePathname()
  const isAuthRoute = pathname.startsWith('/auth')
  const isApiAuthRoute = pathname.startsWith('/api/auth')
  
  // Don't apply auth protection to auth routes
  if (isAuthRoute || isApiAuthRoute) {
    return <>{children}</>
  }
  
  // Apply auth protection to all other routes
  return <ClientAuthWrapper>{children}</ClientAuthWrapper>
} 