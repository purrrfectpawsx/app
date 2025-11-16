import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, Dog, Cat, Bird, Rabbit, MoreHorizontal } from 'lucide-react'

import { petFormSchema, type PetFormData } from '@/schemas/pets'
import { usePets, FreeTierLimitError } from '@/hooks/usePets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PetPhotoUpload } from '@/components/pets/PetPhotoUpload'
import { UpgradePromptDialog } from '@/components/subscription/UpgradePromptDialog'

interface CreatePetFormProps {
  mode?: 'create' | 'edit'
  initialData?: Pet
  onSuccess?: (petId: string) => void
  onCancel?: () => void
}

const speciesOptions = [
  { value: 'dog', label: 'Dog', icon: Dog },
  { value: 'cat', label: 'Cat', icon: Cat },
  { value: 'bird', label: 'Bird', icon: Bird },
  { value: 'rabbit', label: 'Rabbit', icon: Rabbit },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
] as const

export function CreatePetForm({ mode = 'create', initialData, onSuccess, onCancel }: CreatePetFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { createPet, updatePet, isLoading } = usePets()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    mode: 'onChange',
    defaultValues: initialData ? {
      name: initialData.name,
      species: initialData.species,
      breed: initialData.breed || '',
      birth_date: initialData.birth_date ? new Date(initialData.birth_date) : undefined,
      weight: initialData.weight || undefined,
      gender: initialData.gender || undefined,
      spayed_neutered: initialData.spayed_neutered || false,
      microchip: initialData.microchip || '',
      notes: initialData.notes || '',
    } : {
      spayed_neutered: false,
    },
  })

  const onSubmit = async (data: PetFormData) => {
    try {
      setError(null)
      setSuccessMessage(null)

      let pet: Pet

      if (mode === 'edit' && initialData) {
        // Update existing pet
        pet = await updatePet(initialData.id, data, initialData.photo_url)
        setSuccessMessage('Pet updated successfully!')
      } else {
        // Create new pet
        pet = await createPet(data)
        setSuccessMessage('Pet created successfully!')
      }

      // Capture pet ID for closure
      const petId = pet.id

      // Wait 2 seconds to show success message, then trigger callback or navigate
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(petId)
        } else if (mode === 'create') {
          // Default: navigate to pet detail page for new pets
          navigate(`/pets/${petId}`)
        }
      }, 2000)
    } catch (err) {
      if (err instanceof FreeTierLimitError) {
        setShowUpgradePrompt(true)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <>
      <UpgradePromptDialog
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        feature="pets"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Pet Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Pet Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter your pet's name"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Species */}
      <div className="space-y-2">
        <Label htmlFor="species">
          Species <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="species"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
              <SelectTrigger id="species">
                <SelectValue placeholder="Select a species" />
              </SelectTrigger>
              <SelectContent>
                {speciesOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.species && (
          <p className="text-sm text-red-500">{errors.species.message}</p>
        )}
      </div>

      {/* Breed */}
      <div className="space-y-2">
        <Label htmlFor="breed">Breed (optional)</Label>
        <Input
          id="breed"
          placeholder="Enter breed"
          {...register('breed')}
          disabled={isLoading}
        />
        {errors.breed && (
          <p className="text-sm text-red-500">{errors.breed.message}</p>
        )}
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <Label htmlFor="birth_date">Birth Date (optional)</Label>
        <Controller
          name="birth_date"
          control={control}
          render={({ field }) => (
            <Input
              id="birth_date"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null
                field.onChange(date)
              }}
              disabled={isLoading}
            />
          )}
        />
        {errors.birth_date && (
          <p className="text-sm text-red-500">{errors.birth_date.message}</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label htmlFor="gender">Gender (optional)</Label>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
              disabled={isLoading}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      {/* Spayed/Neutered */}
      <div className="flex items-center space-x-2">
        <Controller
          name="spayed_neutered"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="spayed_neutered"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isLoading}
            />
          )}
        />
        <Label htmlFor="spayed_neutered" className="cursor-pointer">
          Spayed/Neutered
        </Label>
      </div>

      {/* Microchip */}
      <div className="space-y-2">
        <Label htmlFor="microchip">Microchip Number (optional)</Label>
        <Input
          id="microchip"
          placeholder="Enter microchip number"
          {...register('microchip')}
          disabled={isLoading}
        />
        {errors.microchip && (
          <p className="text-sm text-red-500">{errors.microchip.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about your pet"
          rows={3}
          {...register('notes')}
          disabled={isLoading}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      {/* Photo Upload */}
      <Controller
        name="photo"
        control={control}
        render={({ field }) => (
          <PetPhotoUpload
            value={field.value || null}
            onChange={field.onChange}
            error={errors.photo?.message as string | undefined}
          />
        )}
      />

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Pet'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
    </>
  )
}
