import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dog, Cat, Bird, Rabbit, MoreHorizontal } from 'lucide-react'
import { calculatePetAge } from '@/lib/dateUtils'
import { supabase } from '@/lib/supabase'
import type { Pet } from '@/schemas/pets'

const speciesIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: MoreHorizontal,
}

interface PetInfoCardProps {
  pet: Pet
}

export function PetInfoCard({ pet }: PetInfoCardProps) {
  const SpeciesIcon = speciesIcons[pet.species] || MoreHorizontal
  const age = calculatePetAge(pet.birth_date)

  // Optimize photo URL with Supabase Storage transforms
  const getOptimizedPhotoUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null

    // If it's a Supabase Storage URL, add transformation parameters
    if (photoUrl.includes('supabase')) {
      try {
        // Extract the path from the photo URL
        const pathMatch = photoUrl.match(/\/storage\/v1\/object\/public\/([^?]+)/)

        if (pathMatch) {
          const [bucket, ...pathParts] = pathMatch[1].split('/')
          const path = pathParts.join('/')

          // Use getPublicUrl with transform for better image optimization
          const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path, {
              transform: {
                width: 600,
                height: 600,
                resize: 'cover',
              }
            })

          return data.publicUrl
        }
      } catch (error) {
        console.error('Error optimizing photo URL:', error)
      }
    }

    return photoUrl
  }

  const optimizedPhotoUrl = getOptimizedPhotoUrl(pet.photo_url)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pet Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pet Photo */}
          {optimizedPhotoUrl && (
            <div className="md:col-span-2 flex justify-center">
              <img
                src={optimizedPhotoUrl}
                alt={pet.name}
                loading="lazy"
                className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              />
            </div>
          )}

          {/* Name */}
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-base text-gray-900 mt-1">{pet.name}</p>
          </div>

          {/* Species */}
          <div>
            <p className="text-sm font-medium text-gray-500">Species</p>
            <div className="flex items-center gap-2 mt-1">
              <SpeciesIcon className="w-4 h-4 text-gray-700" />
              <p className="text-base text-gray-900 capitalize">{pet.species}</p>
            </div>
          </div>

          {/* Breed */}
          {pet.breed && (
            <div>
              <p className="text-sm font-medium text-gray-500">Breed</p>
              <p className="text-base text-gray-900 mt-1">{pet.breed}</p>
            </div>
          )}

          {/* Birth Date & Age */}
          {pet.birth_date && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">Birth Date</p>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(pet.birth_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="text-base text-gray-900 mt-1">{age}</p>
              </div>
            </>
          )}

          {/* Gender */}
          {pet.gender && (
            <div>
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-base text-gray-900 capitalize mt-1">{pet.gender}</p>
            </div>
          )}

          {/* Spayed/Neutered */}
          <div>
            <p className="text-sm font-medium text-gray-500">Spayed/Neutered</p>
            <p className="text-base text-gray-900 mt-1">
              {pet.spayed_neutered ? 'Yes' : 'No'}
            </p>
          </div>

          {/* Microchip */}
          {pet.microchip && (
            <div>
              <p className="text-sm font-medium text-gray-500">Microchip</p>
              <p className="text-base text-gray-900 mt-1">{pet.microchip}</p>
            </div>
          )}

          {/* Notes */}
          {pet.notes && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Notes</p>
              <p className="text-base text-gray-900 mt-1">{pet.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
