"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Link from 'next/link'
import { registerFormSchema, type RegisterFormData } from '@/app/schemas/auth.schema'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { useRouter } from 'next/navigation'
import { StatusModal } from '@/components/ui/status-modal'

// Common health conditions and allergies
const COMMON_HEALTH_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Arthritis',
  'Depression',
  'Anxiety',
  'COPD',
  'Other'
]

const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Drugs',
  'Aspirin',
  'NSAIDs',
  'Latex',
  'Peanuts',
  'Shellfish',
  'Other'
]

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error'
  })
  const router = useRouter()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      age: null,
      gender: null,
      weight: null,
      weight_unit: null,
      health_conditions: [],
      allergies: [],
      activity_level: null,
      work_type: null,
      communication_preferences: 'email',
      health_literacy_level: 'intermediate',
    },
  })

  // Handle modal close and redirect if needed
  const handleModalClose = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
    if (shouldRedirect) {
      router.push('/auth/login')
    }
  }

  const onSubmit = async (values: RegisterFormData) => {
    try {
      setIsLoading(true)
      setShouldRedirect(false)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show toast notification
        toast.error(data.error || 'Registration failed. Please try again.')
        
        // Show error modal
        setModal({
          isOpen: true,
          title: 'Registration Error',
          message: data.error || 'Registration failed. Please try again.',
          variant: 'error'
        })
        return
      }

      // Show success message
      toast.success(data.message || 'Registration successful! Please check your email to confirm your account.')
      
      // Show success modal
      setShouldRedirect(true)
      setModal({
        isOpen: true,
        title: 'Registration Successful',
        message: 'Registration successful! We have sent you a confirmation email. Please check your inbox and follow the instructions to activate your account.',
        variant: 'success'
      })
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = 'An error occurred during registration. Please try again.'
      toast.error(errorMessage)
      setModal({
        isOpen: true,
        title: 'Connection Error',
        message: errorMessage,
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
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your first name" 
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
              name="last_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your last name" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Create a password" 
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
                    placeholder="Confirm your password" 
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
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter your age" 
                    {...field} 
                    value={field.value || ''} 
                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter weight" 
                      {...field} 
                      value={field.value || ''} 
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight_unit"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Weight Unit</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="health_conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Conditions</FormLabel>
                <FormControl>
                  <MultiSelect
                    placeholder="Select health conditions"
                    options={COMMON_HEALTH_CONDITIONS.map(condition => ({
                      label: condition,
                      value: condition.toLowerCase()
                    }))}
                    {...field}
                    value={field.value || []}
                    onChange={value => field.onChange(value)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allergies</FormLabel>
                <FormControl>
                  <MultiSelect
                    placeholder="Select allergies"
                    options={COMMON_ALLERGIES.map(allergy => ({
                      label: allergy,
                      value: allergy.toLowerCase()
                    }))}
                    {...field}
                    value={field.value || []}
                    onChange={value => field.onChange(value)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light Activity</SelectItem>
                    <SelectItem value="moderate">Moderate Activity</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="work_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="office">Office Work</SelectItem>
                    <SelectItem value="manual_labor">Manual Labor</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="remote">Remote Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="communication_preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Communication Preferences</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email only</SelectItem>
                    <SelectItem value="sms">SMS only</SelectItem>
                    <SelectItem value="both">Both Email and SMS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="health_literacy_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Literacy Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>

      <StatusModal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
      />
    </>
  )
} 