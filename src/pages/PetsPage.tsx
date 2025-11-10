import { useState, useEffect } from 'react'
import { PlusCircle, Loader2, Dog, Cat, Bird, Rabbit, MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreatePetForm } from '@/components/pets/CreatePetForm'
import { usePets } from '@/hooks/usePets'
import type { Pet } from '@/schemas/pets'

const speciesIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: MoreHorizontal,
}

export function PetsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const { getAllPets, isLoading } = usePets()
  const navigate = useNavigate()

  useEffect(() => {
    loadPets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPets = async () => {
    try {
      const fetchedPets = await getAllPets()
      setPets(fetchedPets)
    } catch (err) {
      console.error('Error loading pets:', err)
    }
  }

  const handleCreateSuccess = (petId: string) => {
    // Reload pets list
    loadPets()
    // Wait 2 seconds to show success message before closing dialog and navigating
    setTimeout(() => {
      setIsCreateDialogOpen(false)
      navigate(`/pets/${petId}`)
    }, 2000)
  }

  const handlePetClick = (petId: string) => {
    navigate(`/pets/${petId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
            <p className="text-gray-600 mt-1">
              Manage your pet profiles and track their health
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Pet
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && pets.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center space-y-4">
              <p className="text-gray-500">
                No pets yet. Click "Create Pet" to add your first pet.
              </p>
            </div>
          </div>
        )}

        {/* Pets Grid */}
        {!isLoading && pets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => {
              const SpeciesIcon = speciesIcons[pet.species] || MoreHorizontal
              return (
                <Card
                  key={pet.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handlePetClick(pet.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Pet Photo or Icon */}
                      {pet.photo_url ? (
                        <img
                          src={pet.photo_url}
                          alt={pet.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                          <SpeciesIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Pet Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {pet.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <SpeciesIcon className="w-4 h-4" />
                          <span className="capitalize">{pet.species}</span>
                          {pet.breed && <span>• {pet.breed}</span>}
                        </div>
                        {pet.birth_date && (
                          <p className="text-xs text-gray-500 mt-2">
                            Born: {new Date(pet.birth_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Create Pet Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Pet Profile</DialogTitle>
            </DialogHeader>
            <CreatePetForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
