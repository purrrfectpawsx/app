import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, Dog, Cat, Bird, Rabbit, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

import { usePets } from '@/hooks/usePets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Pet } from '@/schemas/pets'

const speciesIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: MoreHorizontal,
}

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>()
  const navigate = useNavigate()
  const { getPetById, isLoading } = usePets()
  const [pet, setPet] = useState<Pet | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPet = async () => {
      if (!petId) {
        setError('Pet ID is required')
        return
      }

      try {
        const fetchedPet = await getPetById(petId)
        if (!fetchedPet) {
          setError('Pet not found')
        } else {
          setPet(fetchedPet)
        }
      } catch (err) {
        console.error('Error fetching pet:', err)
        setError('Failed to load pet details')
      }
    }

    fetchPet()
  }, [petId, getPetById])

  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return null
    try {
      const age = formatDistanceToNow(parseISO(birthDate), { addSuffix: false })
      return age
    } catch {
      return null
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-500">Loading pet details...</p>
        </div>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || 'Pet not found'}
          </h2>
          <p className="text-gray-600">
            The pet you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const SpeciesIcon = speciesIcons[pet.species] || MoreHorizontal
  const age = calculateAge(pet.birth_date)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <SpeciesIcon className="w-4 h-4" />
              <span className="capitalize">{pet.species}</span>
              {pet.breed && <span>• {pet.breed}</span>}
            </div>
          </div>
        </div>

        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Photo */}
              {pet.photo_url && (
                <div className="md:col-span-2">
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base text-gray-900">{pet.name}</p>
              </div>

              {/* Species */}
              <div>
                <p className="text-sm font-medium text-gray-500">Species</p>
                <div className="flex items-center gap-2">
                  <SpeciesIcon className="w-4 h-4 text-gray-700" />
                  <p className="text-base text-gray-900 capitalize">{pet.species}</p>
                </div>
              </div>

              {/* Breed */}
              {pet.breed && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Breed</p>
                  <p className="text-base text-gray-900">{pet.breed}</p>
                </div>
              )}

              {/* Birth Date & Age */}
              {pet.birth_date && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Birth Date</p>
                    <p className="text-base text-gray-900">
                      {new Date(pet.birth_date).toLocaleDateString()}
                    </p>
                  </div>
                  {age && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Age</p>
                      <p className="text-base text-gray-900">{age}</p>
                    </div>
                  )}
                </>
              )}

              {/* Gender */}
              {pet.gender && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-base text-gray-900 capitalize">{pet.gender}</p>
                </div>
              )}

              {/* Spayed/Neutered */}
              <div>
                <p className="text-sm font-medium text-gray-500">Spayed/Neutered</p>
                <p className="text-base text-gray-900">
                  {pet.spayed_neutered ? 'Yes' : 'No'}
                </p>
              </div>

              {/* Microchip */}
              {pet.microchip && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Microchip</p>
                  <p className="text-base text-gray-900">{pet.microchip}</p>
                </div>
              )}

              {/* Notes */}
              {pet.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-base text-gray-900">{pet.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder sections for future stories */}
        <Card>
          <CardHeader>
            <CardTitle>Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Health records will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Expense tracking will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Reminders will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Document storage will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
