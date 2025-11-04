import { useState } from 'react'
import { X, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function VerificationBanner() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  // Don't show banner if:
  // - No user logged in
  // - Email is already verified
  // - Banner was dismissed
  if (!user || isEmailVerified || isDismissed) {
    return null
  }

  const handleResend = async () => {
    try {
      setIsResending(true)
      setResendMessage(null)
      await resendVerificationEmail()
      setResendMessage('Verification email sent! Check your inbox.')
      
      // Hide message after 5 seconds
      setTimeout(() => setResendMessage(null), 5000)
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : 'Failed to resend email'
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Please verify your email address
              </p>
              {resendMessage ? (
                <p className="text-xs text-yellow-700 mt-1">{resendMessage}</p>
              ) : (
                <p className="text-xs text-yellow-700 mt-1">
                  Check your inbox for the verification link or{' '}
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="underline hover:no-underline font-medium disabled:opacity-50"
                  >
                    {isResending ? 'sending...' : 'resend email'}
                  </button>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
