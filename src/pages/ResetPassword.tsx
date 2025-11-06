import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { supabase } from '@/lib/supabase'

export function ResetPassword() {
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Supabase automatically detects the token in the URL hash and exchanges it for a session
    // We need to listen for the PASSWORD_RECOVERY event to know when the session is ready
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('Auth state change event:', event, 'Session:', !!session)
        }

        if (event === 'PASSWORD_RECOVERY') {
          // Token is valid and session is established
          setIsValidToken(true)
        } else if (event === 'INITIAL_SESSION') {
          // Check if we have a valid session on initial load
          if (session) {
            // We have a session - token is valid
            setIsValidToken(true)
          } else {
            // No session - check for errors or missing token
            const hashParams = new URLSearchParams(window.location.hash.substring(1))

            if (hashParams.has('error')) {
              // Supabase returned an error (expired/invalid token)
              const errorDesc = hashParams.get('error_description') || 'Invalid or expired reset link'
              setError(errorDesc)
              setIsValidToken(false)
            } else if (!hashParams.has('access_token') && !hashParams.has('type')) {
              // No token at all in URL
              setIsValidToken(false)
            }
            // If there's a token but no session yet, keep waiting
          }
        }
      }
    )

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <AuthLayout title="Reset your password" description="Enter your new password below">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Verifying reset link...</p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Invalid or missing token
  if (!isValidToken) {
    return (
      <AuthLayout title="Invalid reset link" description="">
        <div className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            <p className="font-medium mb-1">Invalid or expired link</p>
            <p>
              {error || 'This password reset link is invalid or has expired. Reset links are only valid for 1 hour.'}
            </p>
          </div>
          <div className="space-y-2">
            <Link
              to="/forgot-password"
              className="inline-block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Request new reset link
            </Link>
            <Link
              to="/login"
              className="inline-block w-full text-center text-sm text-primary hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Valid token - show reset form
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your new password below"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
