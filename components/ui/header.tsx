"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Pill, BookOpen, Bell, User } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { LogoutButton } from '@/components/ui/logout-button'
import { useAuth } from '@/app/_components/auth-provider'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Medications',
    href: '/medications',
    icon: Pill
  },
  {
    name: 'Education',
    href: '/education',
    icon: BookOpen
  },
  {
    name: 'Alerts',
    href: '/alerts',
    icon: Bell
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User
  }
]

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  
  console.log('Header component:', { isAuthenticated, isLoading, pathname })
  
  // Don't show the header on auth routes, when authentication is loading, or when user is not authenticated
  if (pathname.startsWith('/auth/') || isLoading || !isAuthenticated) {
    return null
  }

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between bg-white">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">MedMinder</span>
          <span className="text-xl font-bold text-primary">Plus</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <LogoutButton className="ml-4" />
      </div>
    </header>
  )
} 