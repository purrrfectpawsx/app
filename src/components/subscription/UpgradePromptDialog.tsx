import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface UpgradePromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
}

export function UpgradePromptDialog({
  open,
  onOpenChange,
  feature = 'pets',
}: UpgradePromptDialogProps) {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    onOpenChange(false)
    navigate('/pricing')
  }

  const getFeatureMessage = () => {
    switch (feature) {
      case 'pets':
        return 'Free plan allows 1 pet. Upgrade to Premium for unlimited pets.'
      case 'health-records':
        return 'Free plan allows 50 health records. Upgrade to Premium for unlimited records.'
      case 'expenses':
        return 'Free plan allows 100 expenses per month. Upgrade to Premium for unlimited expenses.'
      case 'storage':
        return 'Free plan includes 100MB storage. Upgrade to Premium for 10GB storage.'
      case 'reminders':
        return 'Free plan allows 10 reminders. Upgrade to Premium for unlimited reminders.'
      default:
        return 'Upgrade to Premium to unlock unlimited access to all features.'
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade to Premium</AlertDialogTitle>
          <AlertDialogDescription>{getFeatureMessage()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            Upgrade to Premium
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
