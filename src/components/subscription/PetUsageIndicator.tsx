interface PetUsageIndicatorProps {
  petCount: number
  subscriptionTier: 'free' | 'premium'
}

export function PetUsageIndicator({
  petCount,
  subscriptionTier,
}: PetUsageIndicatorProps) {
  if (subscriptionTier === 'premium') {
    return (
      <span className="text-sm text-muted-foreground">
        Unlimited pets (Premium)
      </span>
    )
  }

  const isAtLimit = petCount >= 1
  const textColor = isAtLimit ? 'text-amber-600' : 'text-muted-foreground'

  return (
    <span className={`text-sm ${textColor}`}>
      {petCount}/1 pets used (Free plan)
    </span>
  )
}
