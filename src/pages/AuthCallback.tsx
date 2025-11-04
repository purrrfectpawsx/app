import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { supabase } from '@/lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
              navigate('/email-verified', { replace: true })
            } else {
              throw new Error('Email verification incomplete')
            }
          } else {
            throw new Error('Missing verification tokens')
          }
        } else {
          // Not a verification callback, redirect to login
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Verification callback error:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'Verification failed'
        
        // Handle specific error cases
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          setError('This verification link has expired or is invalid. Please request a new one.')
        } else {
          setError(errorMessage)
        }

        // Redirect to verification pending page after showing error
        setTimeout(() => {
          navigate('/verify-email', { replace: true })
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <AuthLayout
      title={error ? 'Verification Error' : 'Verifying your email...'}
      description={error ? undefined : 'Please wait while we verify your email address'}
    >
      {error ? (
        <div className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Redirecting to verification page...
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
