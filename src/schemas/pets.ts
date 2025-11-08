import { z } from 'zod'

export const petFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Pet name is required')
    .max(100, 'Name is too long (max 100 characters)'),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other'], {
    required_error: 'Please select a species',
  }),
  breed: z
    .string()
    .max(100, 'Breed name is too long (max 100 characters)')
    .optional()
    .or(z.literal('')),
  birth_date: z
    .date()
    .max(new Date(), 'Birth date cannot be in the future')
    .optional()
    .nullable(),
  gender: z.enum(['male', 'female', 'unknown']).optional().nullable(),
  spayed_neutered: z.boolean().default(false),
  microchip: z
    .string()
    .max(50, 'Microchip number is too long (max 50 characters)')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes are too long (max 500 characters)')
    .optional()
    .or(z.literal('')),
  photo: z
    .custom<File | null | undefined>(
      (val) => val === null || val === undefined || val instanceof File,
      { message: 'Photo must be a valid file' }
    )
    .optional(),
})

export type PetFormData = z.infer<typeof petFormSchema>

// Type for pet data stored in database
export interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other'
  breed?: string | null
  birth_date?: string | null
  photo_url?: string | null
  gender?: 'male' | 'female' | 'unknown' | null
  spayed_neutered: boolean
  microchip?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}
