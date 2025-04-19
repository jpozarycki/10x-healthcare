"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Link from 'next/link'
import { recoverPasswordFormSchema, type RecoverPasswordFormData } from '@/app/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function RecoverForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: RecoverPasswordFormData) => {
    // Form submission will be implemented later
    console.log(values)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-semibold">Check Your Email</h2>
        <p className="text-muted-foreground">
          We have sent password recovery instructions to your email address.
          Please check your inbox and follow the instructions to reset your password.
        </p>
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={() => setIsSubmitted(false)} 
            variant="outline"
          >
            Try another email
          </Button>
          <Link href="/auth/login">
            <Button variant="link" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Forgot Password?</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

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

        <div className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending instructions...' : 'Send Recovery Instructions'}
          </Button>

          <Link href="/auth/login">
            <Button variant="link" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </form>
    </Form>
  )
} 