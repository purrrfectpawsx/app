import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { supabase } from '@/lib/supabase'


// Environment-aware logging
const isDevelopment = import.meta.env.DEV
const logError = (message: string, error?: unknown) => {
  if (isDevelopment) {
    console.error(message, error)
  }
}

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true // Cleanup flag

    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // Check if this is an email verification callback
        if (type === 'signup' || type === 'email') {
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (sessionError) throw sessionError

            // Check if email is verified
            if (data.user?.email_confirmed_at) {
              // Email verified successfully
              if (isMounted) {
                navigate('/email-verified', { replace: true })
              }
            } else {
              throw new Error('Email verification incomplete')
            }
          } else {
            throw new Error('Missing verification tokens')
          }
        } else if (accessToken && refreshToken) {
          // OAuth callback (Google, etc.)
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) throw sessionError

          if (data.user) {
            // Use upsert for atomic profile creation/update (fixes race condition)
            // This ensures that simultaneous OAuth logins don't cause duplicate key errors
            const { error: profileUpsertError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User',
                subscription_tier: 'free',
              }, {
                onConflict: 'id', // Update on conflict with existing id
              })

            if (profileUpsertError) {
              logError('Profile creation/update error:', profileUpsertError)
              throw new Error('Account created but profile setup failed. Please contact support.')
            }

            // Successfully authenticated and profile is ready
            // Redirect to dashboard (VerifiedRoute will handle email verification check)
            if (isMounted) {
              navigate('/dashboard', { replace: true })
            }
          } else {
            throw new Error('Authentication failed')
          }
        } else {
          // No valid tokens or type, redirect to login
          if (isMounted) {
            navigate('/login', { replace: true })
          }
        }
      } catch (err) {
        logError('Auth callback error:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'Authentication failed'

        // Handle specific error cases
        let displayMessage = 'Sign-in failed. Please try again.'
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          displayMessage = 'This link has expired or is invalid. Please try signing in again.'
        } else if (errorMessage.includes('profile')) {
          displayMessage = errorMessage // Profile-specific errors already have good messages
        }

        if (isMounted) {
          setError(displayMessage)

          // Redirect to login page after showing error
          setTimeout(() => {
            if (isMounted) {
              navigate('/login', { replace: true })
            }
          }, 3000)
        }
      }
    }

    handleCallback()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [navigate])

  return (
    <AuthLayout
      title={error ? 'Authentication Error' : 'Signing you in...'}
      description={error ? undefined : 'Please wait while we complete your sign-in'}
    >
      {error ? (
        <div className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </AuthLayout>
  )
}
