"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { loginFormSchema, type LoginFormData } from '@/app/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StatusModal, useStatusModal } from '@/components/ui/status-modal'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { status, showError, showSuccess, closeStatus } = useStatusModal()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show error modal with details
        showError(
          data.error || "Incorrect login data. Please, try again", 
          "Authentication Failed"
        )
        return
      }

      // Show success modal
      showSuccess(
        "Login successful! Redirecting to dashboard...",
        "Authentication Successful"
      )
      
      // Wait a moment to show the success message before redirecting
      setTimeout(() => {
        // Force hard navigation instead of client-side routing
        window.location.href = '/dashboard'
      }, 1500)
    } catch (error) {
      showError(
        "An error occurred during sign in. Please try again.",
        "Connection Error"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="flex justify-between text-sm">
              <Link 
                href="/auth/register" 
                className="text-primary hover:underline"
              >
                Create an account
              </Link>
              <Link 
                href="/auth/recover" 
                className="text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </form>
      </Form>

      {/* Error Modal */}
      <StatusModal
        isOpen={status.isOpen}
        onClose={closeStatus}
        title={status.title}
        message={status.message}
        variant={status.variant}
      />
    </>
  )
} 