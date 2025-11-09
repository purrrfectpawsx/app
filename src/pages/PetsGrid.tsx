import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'

import { usePets } from '@/hooks/usePets'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PetCard } from '@/components/pets/PetCard'
import { EmptyPetsState } from '@/components/pets/EmptyPetsState'
import { CreatePetForm } from '@/components/pets/CreatePetForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Pet } from '@/schemas/pets'

export function PetsGrid() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAllPets, isLoading } = usePets()

  const fetchPets = useCallback(async () => {
    try {
      setError(null)
      const fetchedPets = await getAllPets()
      setPets(fetchedPets)
    } catch (err) {
      console.error('Error fetching pets:', err)
      setError('Failed to load pets. Please try again.')
    }
  }, [getAllPets])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const handleAddPet = () => {
    setIsDialogOpen(true)
  }

  const handlePetCreated = () => {
    setIsDialogOpen(false)
    // Refresh pets list
    fetchPets()
  }

  // Loading state with skeleton cards
  if (isLoading && pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-gray-900">Oops!</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchPets}>Retry</Button>
        </div>
      </div>
    )
  }

  // Shared dialog component
  const petDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Pet Profile</DialogTitle>
        </DialogHeader>
        <CreatePetForm
          onSuccess={handlePetCreated}
          onCancel={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )

  // Empty state
  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {petDialog}
        <EmptyPetsState onAddPet={handleAddPet} />
      </div>
    )
  }

  // Grid with pets
  return (
    <div className="min-h-screen bg-gray-50">
      {petDialog}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Pets {pets.length > 0 && `(${pets.length})`}
          </h1>
          <Button onClick={handleAddPet}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pet
          </Button>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      </div>
    </div>
  )
}
