import { Dog } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyPetsStateProps {
  onAddPet: () => void
}

export function EmptyPetsState({ onAddPet }: EmptyPetsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <Dog className="w-16 h-16 text-gray-400 mb-4" />

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        You haven't added any pets yet
      </h2>

      <p className="text-gray-600 mb-6 max-w-md">
        Start by creating your first pet profile to track their health and expenses
      </p>

      <Button onClick={onAddPet} size="lg">
        Add Your First Pet
      </Button>

      <p className="text-sm text-gray-500 mt-4">
        Track health records, expenses, and more
      </p>
    </div>
  )
}
