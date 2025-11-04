import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmailVerified() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handleContinue = () => {
    navigate('/dashboard')
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-green-600">Email verified successfully!</CardTitle>
        <CardDescription>Your account is now active</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Thank you for verifying your email address. You can now access all features of PetCare.
          </p>
          {countdown > 0 && (
            <p className="text-xs text-muted-foreground">
              Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          )}
        </div>

        <Button className="w-full" onClick={handleContinue}>
          Continue to Dashboard
        </Button>
      </CardContent>
    </Card>
  )
}
