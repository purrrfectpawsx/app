import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { GoogleIcon } from './GoogleIcon'

// Environment-aware logging
const isDevelopment = import.meta.env.DEV
const logError = (message: string, error?: unknown) => {
  if (isDevelopment) {
    console.error(message, error)
  }
}

export function GoogleOAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        throw oauthError
      }

      // OAuth redirect will happen automatically
      // No need to manually redirect here
    } catch (err) {
      setIsLoading(false)

      // Enhanced error handling
      let errorMessage = 'Unable to sign in with Google'

      if (err instanceof Error) {
        const message = err.message.toLowerCase()

        // Network errors
        if (err.name === 'TypeError' || message.includes('fetch') || message.includes('network')) {
          errorMessage = 'Unable to connect to Google. Check your internet connection.'
        }
        // OAuth configuration errors
        else if (message.includes('provider') || message.includes('oauth')) {
          errorMessage = 'OAuth configuration error. Please contact support.'
        }
        // Generic Supabase errors
        else if (message) {
          errorMessage = 'Sign-in failed. Please try again.'
        }
      }

      setError(errorMessage)
      logError('Google OAuth error:', err)
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continue with Google
          </>
        )}
      </Button>

      {error && (
        <p className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
