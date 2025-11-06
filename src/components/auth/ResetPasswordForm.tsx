import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, Check, X } from 'lucide-react'

import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange', // Real-time validation
  })

  const password = watch('password', '')

  // Password validation helpers for real-time feedback
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError(null)
      setIsLoading(true)

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        throw updateError
      }

      // Password updated successfully
      // User is automatically logged in after password reset
      // Navigate to dashboard
      navigate('/dashboard', { replace: true })
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
        // Invalid or expired token
        else if (
          message.includes('invalid') ||
          message.includes('expired') ||
          message.includes('token')
        ) {
          errorMessage =
            'This password reset link is invalid or has expired. Please request a new one.'
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
          errorMessage = 'Unable to reset password. Please try again.'
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}

        {/* Real-time password validation feedback */}
        {password && (
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-muted-foreground">Password requirements:</p>
            <div className="flex items-center space-x-2">
              {passwordValidation.minLength ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  passwordValidation.minLength
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }
              >
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {passwordValidation.hasUppercase ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  passwordValidation.hasUppercase
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }
              >
                At least 1 uppercase letter
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {passwordValidation.hasLowercase ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  passwordValidation.hasLowercase
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }
              >
                At least 1 lowercase letter
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {passwordValidation.hasNumber ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  passwordValidation.hasNumber
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }
              >
                At least 1 number
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isLoading}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
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
            Resetting password...
          </>
        ) : (
          'Reset password'
        )}
      </Button>
    </form>
  )
}
