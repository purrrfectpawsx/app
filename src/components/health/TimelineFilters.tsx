import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { HealthRecord, HealthRecordType } from '@/types/healthRecords'

// Extended filter type to include 'all' option
export type FilterType = 'all' | HealthRecordType

interface FilterOption {
  value: FilterType
  label: string
}

interface TimelineFiltersProps {
  healthRecords: HealthRecord[]
  activeFilters: FilterType[]
  onFilterChange: (filters: FilterType[]) => void
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'vaccine', label: 'Vaccines' },
  { value: 'medication', label: 'Medications' },
  { value: 'vet_visit', label: 'Vet Visits' },
  { value: 'symptom', label: 'Symptoms' },
  { value: 'weight_check', label: 'Weight Checks' },
]

export function TimelineFilters({
  healthRecords,
  activeFilters,
  onFilterChange,
}: TimelineFiltersProps) {
  const { toast } = useToast()

  // Calculate record counts for each filter type
  const counts = useMemo(() => {
    const result: Record<FilterType, number> = {
      all: healthRecords.length,
      vaccine: 0,
      medication: 0,
      vet_visit: 0,
      symptom: 0,
      weight_check: 0,
    }

    healthRecords.forEach((record) => {
      result[record.record_type]++
    })

    return result
  }, [healthRecords])

  const handleFilterClick = (filterValue: FilterType) => {
    let newFilters: FilterType[]

    // Special handling for "All" filter
    if (filterValue === 'all') {
      // Clicking "All" when it's not active -> deselect all others, activate only "All"
      newFilters = ['all']
    } else {
      // Clicking a specific filter
      const isCurrentlyActive = activeFilters.includes(filterValue)
      const allOtherFilterTypes: HealthRecordType[] = ['vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check']

      if (isCurrentlyActive) {
        // Trying to deselect this filter
        const remainingFilters = activeFilters.filter((f) => f !== filterValue)

        // Prevent deselecting the last active filter (AC #4)
        if (remainingFilters.length === 0) {
          toast({
            title: 'Cannot deselect all filters',
            description: 'At least one filter must be active',
            variant: 'destructive',
          })
          return
        }

        newFilters = remainingFilters
      } else {
        // Activating a new filter
        // If "All" is currently active, replace it with the clicked filter
        if (activeFilters.includes('all')) {
          newFilters = [filterValue]
        } else {
          // Add the clicked filter to active filters
          newFilters = [...activeFilters, filterValue]

          // Check if all specific types are now selected -> activate "All"
          const allTypesSelected = allOtherFilterTypes.every((type) => newFilters.includes(type))
          if (allTypesSelected) {
            newFilters = ['all']
          }
        }
      }
    }

    onFilterChange(newFilters)
  }

  // Handle arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % FILTER_OPTIONS.length
      const nextButton = document.querySelector(`[data-filter-index="${nextIndex}"]`) as HTMLButtonElement
      nextButton?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + FILTER_OPTIONS.length) % FILTER_OPTIONS.length
      const prevButton = document.querySelector(`[data-filter-index="${prevIndex}"]`) as HTMLButtonElement
      prevButton?.focus()
    }
  }

  return (
    <>
      {/* Screen reader announcement for filter changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeFilters.includes('all')
          ? `Showing all ${healthRecords.length} health records`
          : `Showing ${healthRecords.filter(r => activeFilters.includes(r.record_type)).length} health records`
        }
      </div>

      <div
        className="flex flex-wrap gap-2 mb-6"
        role="group"
        aria-label="Filter timeline by record type"
      >
      {FILTER_OPTIONS.map((option, index) => {
        const isActive = activeFilters.includes(option.value)
        const count = counts[option.value]

        return (
          <button
            key={option.value}
            data-filter-index={index}
            onClick={() => handleFilterClick(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
              'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isActive
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300'
            )}
            aria-pressed={isActive}
            aria-label={`Filter by ${option.label} (${count} records)`}
          >
            <span>{option.label}</span>
            <span
              className={cn(
                'ml-1 px-2 py-0.5 rounded text-xs font-semibold',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
      </div>
    </>
  )
}
