"use client"

import { Header } from '@/components/ui/header'
import { MobileNavigation } from '@/components/ui/mobile-navigation'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container pb-16 md:pb-0 bg-white">
        {children}
      </main>
      <MobileNavigation />
    </div>
  )
} 