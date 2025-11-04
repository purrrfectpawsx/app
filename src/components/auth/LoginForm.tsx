import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Real-time validation
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      setIsLoading(true)

      await signIn(data.email, data.password, rememberMe)

      // Successful login - redirect to dashboard
      // Note: VerifiedRoute will handle unverified users
      navigate('/dashboard')
    } catch (err) {
      // Enhanced error handling with specific error types
      let errorMessage = 'An error occurred during login'

      if (err instanceof Error) {
        const message = err.message.toLowerCase()

        // Network errors
        if (err.name === 'TypeError' || message.includes('fetch') || message.includes('network')) {
          errorMessage = 'Unable to connect. Please check your internet connection and try again.'
        }
        // Rate limiting / account lockout
        else if (message.includes('rate limit') || message.includes('too many') || message.includes('locked')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
        }
        // Invalid credentials (generic message for security)
        else if (message.includes('invalid') || message.includes('credentials') || message.includes('email') || message.includes('password')) {
          errorMessage = 'Invalid email or password'
        }
        // Service unavailable / timeout
        else if (message.includes('timeout') || message.includes('unavailable') || message.includes('503') || message.includes('500')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a few moments.'
        }
        // Default to error message
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

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </label>
        </div>
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
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
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="underline hover:no-underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
