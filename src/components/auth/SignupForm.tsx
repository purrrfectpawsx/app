import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { signupSchema, type SignupFormData } from '@/schemas/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange', // Real-time validation
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null)
      setIsLoading(true)

      await signUp(data.email, data.password, data.name)

      // Redirect to email verification prompt
      navigate('/verify-email', { state: { email: data.email } })
    } catch (err) {
      // Enhanced error handling with specific error types
      let errorMessage = 'An error occurred during signup'

      if (err instanceof Error) {
        const message = err.message.toLowerCase()

        // Network errors
        if (err.name === 'TypeError' || message.includes('fetch') || message.includes('network')) {
          errorMessage = 'Unable to connect. Please check your internet connection and try again.'
        }
        // Rate limiting
        else if (message.includes('rate limit') || message.includes('too many')) {
          errorMessage = 'Too many signup attempts. Please wait a few minutes and try again.'
        }
        // Service unavailable / timeout
        else if (message.includes('timeout') || message.includes('unavailable') || message.includes('503') || message.includes('500')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few moments.'
        }
        // Auth-specific errors (duplicate email, account creation issues)
        else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <GoogleOAuthButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
            disabled={isLoading}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
            {error.includes('already exists') && (
              <div className="mt-2">
                <Link to="/login" className="underline hover:no-underline">
                  Go to login page
                </Link>
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
