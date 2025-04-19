"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { resetPasswordFormSchema, type ResetPasswordFormData } from '@/app/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StatusModal } from '@/components/ui/status-modal'

interface StatusState {
  isOpen: boolean
  title: string
  message: string
  variant: 'success' | 'error'
}

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<StatusState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success'
  })
  const router = useRouter()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const closeModal = () => {
    setStatus(prev => ({ ...prev, isOpen: false }))
    // If it was a success modal, redirect to login after closing
    if (status.variant === 'success') {
      router.push('/auth/login')
    }
  }

  const onSubmit = async (values: ResetPasswordFormData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus({
          isOpen: true,
          title: 'Reset Failed',
          message: data.error || "Failed to reset password",
          variant: 'error'
        })
        return
      }

      // Show success modal
      setStatus({
        isOpen: true,
        title: 'Password Reset Successful',
        message: data.message || 'Your password has been successfully reset.',
        variant: 'success'
      })
    } catch (error) {
      setStatus({
        isOpen: true,
        title: 'Connection Error',
        message: "An error occurred. Please try again.",
        variant: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Reset Your Password</h2>
            <p className="text-muted-foreground">
              Please enter your new password below.
            </p>
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your new password" 
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm your new password" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting password...' : 'Reset Password'}
          </Button>
        </form>
      </Form>

      {/* Status Modal */}
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