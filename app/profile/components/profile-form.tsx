"use client"

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { userProfileFormSchema, type UserProfileFormData } from '@/app/schemas/profile.schema'
import { GetProfileResponse } from '@/app/types'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { StatusModal } from '@/components/ui/status-modal'

// Common health conditions and allergies for demonstration
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

// Common timezones for demonstration
const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Hawaii',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland'
]

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success'
  })

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      age: null,
      gender: null,
      weight: null,
      weight_unit: null,
      health_conditions: [],
      allergies: [],
      timezone: '',
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/v1/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data: GetProfileResponse = await response.json()
        const { id, ...formData } = data
        
        // Ensure health_conditions and allergies are string arrays
        const transformedData = {
          ...formData,
          health_conditions: Array.isArray(formData.health_conditions) 
            ? formData.health_conditions.map(String)
            : formData.health_conditions ? [String(formData.health_conditions)] : [],
          allergies: Array.isArray(formData.allergies) 
            ? formData.allergies.map(String)
            : formData.allergies ? [String(formData.allergies)] : [],
        } as UserProfileFormData

        form.reset(transformedData)
      } catch (error) {
        setStatusModal({
          isOpen: true,
          title: 'Error Loading Profile',
          message: 'Failed to load profile data. Please try again.',
          variant: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [form])

  const onSubmit = async (values: UserProfileFormData) => {
    try {
      setIsLoading(true)
      
      // Transform arrays to match database format
      const transformedValues = {
        ...values,
        health_conditions: values.health_conditions || null,
        allergies: values.allergies || null
      }

      const response = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedValues),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      setStatusModal({
        isOpen: true,
        title: 'Success',
        message: 'Your profile has been updated successfully.',
        variant: 'success'
      })
    } catch (error) {
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
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
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} disabled={isLoading} />
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
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMMON_TIMEZONES.map(timezone => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()} 
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
      
      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        title={statusModal.title}
        message={statusModal.message}
        variant={statusModal.variant}
      />
    </>
  )
} 