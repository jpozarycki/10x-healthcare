"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        // Initial check
        const { data } = await supabase.auth.getUser()
        setAuthState({
          isAuthenticated: !!data.user,
          isLoading: false
        })
        
        // Subscribe to auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event)
            setAuthState({
              isAuthenticated: !!session?.user,
              isLoading: false
            })
          }
        )
        
        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth provider error:', error)
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        })
      }
    }
    
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
} 