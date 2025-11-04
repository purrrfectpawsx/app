import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function VerificationPending() {
  const location = useLocation()
  const email = location.state?.email
  const { resendVerificationEmail } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [lastResendTime, setLastResendTime] = useState<number | null>(null)

  const handleResend = async () => {
    // Rate limiting: prevent resend within 60 seconds
    const now = Date.now()
    if (lastResendTime && now - lastResendTime < 60000) {
      const secondsRemaining = Math.ceil((60000 - (now - lastResendTime)) / 1000)
      setResendError(`Please wait ${secondsRemaining} seconds before resending`)
      return
    }

    try {
      setResendError(null)
      setResendSuccess(false)
      setIsResending(true)

      await resendVerificationEmail()

      setResendSuccess(true)
      setLastResendTime(now)

      // Hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to resend verification email'
      setResendError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>We've sent you a verification link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          {email && (
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to:
            </p>
          )}
          {email && <p className="font-medium">{email}</p>}
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account and start using
            PetCare.
          </p>
        </div>

        {resendSuccess && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Verification email sent! Check your inbox and spam folder.</span>
          </div>
        )}

        {resendError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {resendError}
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend verification email'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
