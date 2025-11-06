import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Forgot password schema - only email required
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange', // Real-time validation
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null)
      setSuccess(false)
      setIsLoading(true)

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        throw resetError
      }

      // Show success message (even if email doesn't exist - security best practice)
      setSuccess(true)
    } catch (err) {
      // Enhanced error handling
      let errorMessage = 'An error occurred. Please try again.'

      if (err instanceof Error) {
        const message = err.message.toLowerCase()

        // Network errors
        if (
          err.name === 'TypeError' ||
          message.includes('fetch') ||
          message.includes('network')
        ) {
          errorMessage =
            'Unable to connect. Please check your internet connection and try again.'
        }
        // Rate limiting
        else if (
          message.includes('rate limit') ||
          message.includes('too many')
        ) {
          errorMessage =
            'Too many requests. Please wait a few minutes and try again.'
        }
        // Service unavailable
        else if (
          message.includes('timeout') ||
          message.includes('unavailable') ||
          message.includes('503') ||
          message.includes('500')
        ) {
          errorMessage =
            'Service temporarily unavailable. Please try again in a few moments.'
        }
        // Default generic error for security
        else {
          errorMessage = 'Unable to send reset email. Please try again.'
        }

        // Log error in development only
        if (import.meta.env.DEV) {
          console.error('Password reset error:', err)
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          <p className="font-medium mb-1">Check your email</p>
          <p>
            If an account exists with this email, you'll receive a password
            reset link within 60 seconds.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-block text-sm text-primary hover:underline"
        >
          ← Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          'Send reset link'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline">
          ← Back to login
        </Link>
      </p>
    </form>
  )
}
