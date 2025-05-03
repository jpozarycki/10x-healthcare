"use client"

import { Inter } from 'next/font/google'
import { Layout } from '@/components/ui/layout'
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
        <Layout>
          <ProtectedRouteWrapper>
            {children}
          </ProtectedRouteWrapper>
        </Layout>
      </AuthProvider>
    </div>
  )
} 