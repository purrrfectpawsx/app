import { differenceInYears, differenceInMonths } from 'date-fns'

/**
 * Calculate pet age from birth date
 * @param birthDate - The pet's birth date (string or Date or null)
 * @returns Formatted age string ("X years", "X months", or "Unknown")
 */
export function calculatePetAge(birthDate: string | Date | null | undefined): string {
  if (!birthDate) return 'Unknown'

  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    const now = new Date()

    const years = differenceInYears(now, birth)

    if (years >= 1) {
      return `${years} ${years === 1 ? 'year' : 'years'}`
    }

    const months = differenceInMonths(now, birth)
    return `${months} ${months === 1 ? 'month' : 'months'}`
  } catch {
    return 'Unknown'
  }
}
