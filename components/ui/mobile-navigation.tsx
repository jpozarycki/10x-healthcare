"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Pill, BookOpen, Bell, User } from 'lucide-react'
import { cn } from '@/app/lib/utils'

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

export function MobileNavigation() {
  const pathname = usePathname()

  // Don't show navigation on auth routes
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 bg-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] rounded-md transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 