import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { HealthRecord } from '@/types/healthRecords'

interface DeleteHealthRecordDialogProps {
  record: HealthRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

// Helper to format record type for display
const formatRecordType = (recordType: string): string => {
  return recordType.replace('_', ' ')
}

export function DeleteHealthRecordDialog({
  record,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteHealthRecordDialogProps) {
  if (!record) return null

  const recordTypeDisplay = formatRecordType(record.record_type)
  const formattedDate = format(new Date(record.date), 'MMM d, yyyy')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {recordTypeDisplay}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Are you sure you want to delete this {recordTypeDisplay}?</p>

              <div className="bg-gray-50 rounded-md p-3 text-sm">
                <p className="font-medium text-gray-900">{record.title}</p>
                <p className="text-gray-600">{formattedDate}</p>
              </div>

              <p className="text-red-600 font-medium">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
