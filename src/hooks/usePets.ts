import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Pet, PetFormData } from '@/schemas/pets'

export class FreeTierLimitError extends Error {
  constructor() {
    super('FREE_TIER_LIMIT_REACHED')
    this.name = 'FreeTierLimitError'
  }
}

export function usePets() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createPet = useCallback(
    async (formData: PetFormData): Promise<Pet> => {
      if (!user) {
        throw new Error('You must be logged in to create a pet')
      }

      setIsLoading(true)
      setError(null)

      try {
        // Step 1: Check subscription tier and current pet count
        // Can be bypassed for testing with VITE_BYPASS_TIER_LIMITS=true
        const bypassTierLimits = import.meta.env.VITE_BYPASS_TIER_LIMITS === 'true'

        if (!bypassTierLimits) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Profile fetch error:', profileError)
            throw new Error('Failed to verify subscription status')
          }

          const { count, error: countError } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (countError) {
            console.error('Pet count error:', countError)
            throw new Error('Failed to check pet limit')
          }

          // Step 2: Enforce free tier limit
          if (profile.subscription_tier === 'free' && (count ?? 0) >= 1) {
            throw new FreeTierLimitError()
          }
        }

        // Step 3: Upload photo if provided
        let photoUrl: string | null = null
        if (formData.photo) {
          try {
            // Compress image
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
              fileType: 'image/jpeg',
              initialQuality: 0.8,
            }

            const compressedFile = await imageCompression(formData.photo, options)

            // Generate unique filename
            const fileExt = 'jpg' // Always JPEG after compression
            const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('pets-photos')
              .upload(fileName, compressedFile, {
                contentType: 'image/jpeg',
                upsert: false,
              })

            if (uploadError) {
              console.error('Upload error:', uploadError)
              throw new Error('Failed to upload photo')
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('pets-photos')
              .getPublicUrl(fileName)

            photoUrl = urlData.publicUrl
          } catch (uploadErr) {
            console.error('Photo upload error:', uploadErr)
            throw new Error('Failed to upload photo. Please try again.')
          }
        }

        // Step 4: Insert pet record
        const { data: pet, error: insertError } = await supabase
          .from('pets')
          .insert({
            user_id: user.id,
            name: formData.name,
            species: formData.species,
            breed: formData.breed || null,
            birth_date: formData.birth_date?.toISOString().split('T')[0] || null,
            photo_url: photoUrl,
            gender: formData.gender || null,
            spayed_neutered: formData.spayed_neutered,
            microchip: formData.microchip || null,
            notes: formData.notes || null,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Insert error:', insertError)
          throw new Error('Failed to create pet. Please try again.')
        }

        return pet
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  const getPetById = useCallback(
    async (petId: string): Promise<Pet | null> => {
      if (!user) {
        throw new Error('You must be logged in to view pets')
      }

      setIsLoading(true)
      setError(null)

      try {
        const { data: pet, error: fetchError } = await supabase
          .from('pets')
          .select('*')
          .eq('id', petId)
          .eq('user_id', user.id) // RLS policy ensures this, but explicit check
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // Not found
            return null
          }
          console.error('Fetch error:', fetchError)
          throw new Error('Failed to fetch pet')
        }

        return pet
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  const getAllPets = useCallback(async (): Promise<Pet[]> => {
    if (!user) {
      throw new Error('You must be logged in to view pets')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: pets, error: fetchError } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        throw new Error('Failed to fetch pets')
      }

      return pets || []
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const updatePet = useCallback(
    async (
      petId: string,
      formData: PetFormData,
      existingPhotoUrl: string | null
    ): Promise<Pet> => {
      if (!user) {
        throw new Error('You must be logged in to update a pet')
      }

      setIsLoading(true)
      setError(null)

      try {
        let photoUrl: string | null = existingPhotoUrl

        // Handle photo changes
        if (formData.photo) {
          // User is uploading a new photo
          try {
            // Step 1: Delete old photo from storage if exists
            if (existingPhotoUrl) {
              const pathMatch = existingPhotoUrl.match(/\/pets-photos\/(.+)$/)
              if (pathMatch) {
                const oldPhotoPath = pathMatch[1]
                const { error: deleteError } = await supabase.storage
                  .from('pets-photos')
                  .remove([oldPhotoPath])

                if (deleteError) {
                  console.error('Failed to delete old photo:', deleteError)
                  // Continue anyway - non-blocking
                }
              }
            }

            // Step 2: Compress and upload new photo
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
              fileType: 'image/jpeg',
              initialQuality: 0.8,
            }

            const compressedFile = await imageCompression(formData.photo, options)

            // Generate unique filename
            const fileExt = 'jpg'
            const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('pets-photos')
              .upload(fileName, compressedFile, {
                contentType: 'image/jpeg',
                upsert: false,
              })

            if (uploadError) {
              console.error('Upload error:', uploadError)
              throw new Error('Failed to upload new photo')
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('pets-photos')
              .getPublicUrl(fileName)

            photoUrl = urlData.publicUrl
          } catch (uploadErr) {
            console.error('Photo upload error:', uploadErr)
            throw new Error('Failed to update photo. Please try again.')
          }
        } else if (formData.photo === null && existingPhotoUrl) {
          // User is explicitly removing the photo
          const pathMatch = existingPhotoUrl.match(/\/pets-photos\/(.+)$/)
          if (pathMatch) {
            const oldPhotoPath = pathMatch[1]
            const { error: deleteError } = await supabase.storage
              .from('pets-photos')
              .remove([oldPhotoPath])

            if (deleteError) {
              console.error('Failed to delete photo:', deleteError)
              // Continue anyway
            }
          }
          photoUrl = null
        }

        // Step 3: Update pet record in database
        const { data: pet, error: updateError } = await supabase
          .from('pets')
          .update({
            name: formData.name,
            species: formData.species,
            breed: formData.breed || null,
            birth_date: formData.birth_date?.toISOString().split('T')[0] || null,
            photo_url: photoUrl,
            gender: formData.gender || null,
            spayed_neutered: formData.spayed_neutered,
            microchip: formData.microchip || null,
            notes: formData.notes || null,
          })
          .eq('id', petId)
          .eq('user_id', user.id) // RLS enforcement
          .select()
          .single()

        if (updateError) {
          console.error('Update error:', updateError)
          throw new Error('Failed to update pet. Please try again.')
        }

        return pet
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  return {
    createPet,
    getPetById,
    getAllPets,
    updatePet,
    isLoading,
    error,
  }
}
