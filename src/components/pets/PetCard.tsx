import { useNavigate } from 'react-router-dom'
import { Dog, Cat, Bird, Rabbit, MoreHorizontal } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { calculatePetAge } from '@/lib/dateUtils'
import { supabase } from '@/lib/supabase'
import type { Pet } from '@/schemas/pets'

interface PetCardProps {
  pet: Pet
}

const speciesIcons = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
  other: MoreHorizontal,
}

export function PetCard({ pet }: PetCardProps) {
  const navigate = useNavigate()
  const SpeciesIcon = speciesIcons[pet.species] || MoreHorizontal

  // Get optimized photo URL (thumbnail) or show placeholder
  const getPhotoUrl = () => {
    if (!pet.photo_url) return null

    const url = pet.photo_url

    // Use Supabase image transformation for thumbnail
    // Extract the file path from the URL
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/pets-photos/')

      if (pathParts.length > 1) {
        const filePath = pathParts[1]
        const { data } = supabase.storage
          .from('pets-photos')
          .getPublicUrl(filePath, {
            transform: {
              width: 300,
              height: 300,
              resize: 'cover',
            }
          })

        return data.publicUrl
      }
    } catch (error) {
      console.error('Invalid photo URL:', error)
    }

    // Fallback: append query params or return original URL
    return `${url}?width=300&height=300`
  }

  const thumbnailUrl = getPhotoUrl()
  const age = calculatePetAge(pet.birth_date)

  const handleClick = () => {
    navigate(`/pets/${pet.id}`)
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Pet Photo or Placeholder */}
        <div className="mb-4 flex items-center justify-center h-48 bg-gray-100 rounded-md overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Photo of ${pet.name}, a ${pet.species}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <SpeciesIcon className="w-16 h-16 text-gray-400" />
          )}
        </div>

        {/* Pet Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <SpeciesIcon className="w-4 h-4" />
            <span className="capitalize">{pet.species}</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Age:</span> {age}
          </div>

          {/* Placeholder for overdue vaccine badge (will be implemented in Health epic) */}
          {/* <div className="hidden">
            <Badge variant="destructive" className="text-xs">
              Vaccine Overdue
            </Badge>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}
