import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface TierLimitBannerProps {
  show: boolean
}

export function TierLimitBanner({ show }: TierLimitBannerProps) {
  const navigate = useNavigate()

  if (!show) return null

  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4" />
      <AlertTitle>Free Plan Limit Reached</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You've reached the free plan limit (1 pet). Upgrade to Premium for
          unlimited pets.
        </span>
        <Button size="sm" onClick={() => navigate('/pricing')} className="ml-4">
          Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  )
}
