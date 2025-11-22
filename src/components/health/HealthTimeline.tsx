import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { HealthRecordCard } from './HealthRecordCard'
import { DeleteHealthRecordDialog } from './DeleteHealthRecordDialog'
import { useToast } from '@/hooks/use-toast'
import type { HealthRecord, HealthRecordType } from '@/types/healthRecords'

export type FilterType = 'all' | HealthRecordType

interface HealthTimelineProps {
  petId: string
  onAddRecord?: () => void
  onEditRecord?: (record: HealthRecord) => void
  activeFilters?: FilterType[]
  onRecordsLoaded?: (records: HealthRecord[]) => void
}

const formatRecordType = (recordType: string): string => {
  return recordType.replace('_', ' ')
}

export function HealthTimeline({ petId, onAddRecord, onEditRecord, activeFilters = ['all'], onRecordsLoaded }: HealthTimelineProps) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<HealthRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Ref to store records for rollback
  const recordsBeforeDelete = useRef<HealthRecord[]>([])

  const { toast } = useToast()

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load first 50 records for performance (pagination support)
        const { data, error: fetchError } = await supabase
          .from('health_records')
          .select('*')
          .eq('pet_id', petId)
          .order('date', { ascending: false })
          .range(0, 49)

        if (fetchError) {
          console.error('Error fetching health records:', fetchError)
          setError('Failed to load health records')
          return
        }

        const loadedRecords = data || []
        setRecords(loadedRecords)
        if (onRecordsLoaded) {
          onRecordsLoaded(loadedRecords)
        }
      } catch (err) {
        console.error('Unexpected error fetching health records:', err)
        setError('An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHealthRecords()
  }, [petId, onRecordsLoaded])

  // Check if a vaccine record is overdue
  const isVaccineOverdue = (record: HealthRecord): boolean => {
    if (record.record_type !== 'vaccine') return false
    if (!record.vaccine_data?.expiration_date) return false

    try {
      const expirationDate = new Date(record.vaccine_data.expiration_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare dates only
      return expirationDate < today
    } catch {
      return false
    }
  }

  const handleToggleExpand = (recordId: string) => {
    setExpandedRecordId((prev) => (prev === recordId ? null : recordId))
  }

  const handleDeleteClick = useCallback((record: HealthRecord) => {
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!recordToDelete) return

    const recordId = recordToDelete.id
    const recordType = formatRecordType(recordToDelete.record_type)

    recordsBeforeDelete.current = [...records]
    setRecords(prev => prev.filter(r => r.id !== recordId))
    setIsDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from('health_records')
        .delete()
        .eq('id', recordId)

      if (deleteError) {
        console.error('Error deleting health record:', deleteError)
        setRecords(recordsBeforeDelete.current)
        toast({
          title: 'Delete failed',
          description: deleteError.message === 'new row violates row-level security policy'
            ? 'You do not have permission to delete this record.'
            : 'Failed to delete health record. Please try again.',
          variant: 'destructive',
        })
        return
      }

      setDeleteDialogOpen(false)
      setRecordToDelete(null)
      setExpandedRecordId(null)

      toast({
        title: 'Record deleted',
        description: recordType.charAt(0).toUpperCase() + recordType.slice(1) + ' deleted successfully',
      })

      if (onRecordsLoaded) {
        onRecordsLoaded(records.filter(r => r.id !== recordId))
      }
    } catch (err) {
      console.error('Unexpected error deleting health record:', err)
      setRecords(recordsBeforeDelete.current)
      toast({
        title: 'Delete failed',
        description: 'An unexpected error occurred. Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }, [recordToDelete, records, toast, onRecordsLoaded])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!isDeleting) {
      setDeleteDialogOpen(open)
      if (!open) {
        setRecordToDelete(null)
      }
    }
  }, [isDeleting])

  // Filter records based on activeFilters (AC #3)
  const filteredRecords = useMemo(() => {
    if (activeFilters.includes('all')) {
      return records
    }
    return records.filter((record) => activeFilters.includes(record.record_type))
  }, [records, activeFilters])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6 text-center">
        <p className="text-red-600">{error}</p>
        <p className="text-gray-500 mt-2">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    )
  }

  // Empty state
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Plus className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Add your first health record
          </h3>
          <p className="text-gray-600 mb-6">
            Start tracking your pet's health history by adding vaccine records, vet visits, medications, and more.
          </p>
          {onAddRecord && (
            <Button onClick={onAddRecord}>
              <Plus className="mr-2 h-4 w-4" />
              Add Health Record
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Timeline with records
  return (
    <>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredRecords.map((record) => (
          <HealthRecordCard
            key={record.id}
            record={record}
            isExpanded={expandedRecordId === record.id}
            onToggleExpand={() => handleToggleExpand(record.id)}
            onEdit={onEditRecord}
            onDelete={handleDeleteClick}
            isOverdue={isVaccineOverdue(record)}
          />
        ))}
      </div>

      <DeleteHealthRecordDialog
        record={recordToDelete}
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
