"use client"

import { Inter } from 'next/font/google'
import { Header } from '@/components/ui/header'
import { ProtectedRouteWrapper } from './protected-route-wrapper'
import AuthProvider from './auth-provider'

const inter = Inter({ subsets: ['latin'] })

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <Header />
        <div className="container py-4">
          <ProtectedRouteWrapper>
            {children}
          </ProtectedRouteWrapper>
        </div>
      </AuthProvider>
    </div>
  )
} 