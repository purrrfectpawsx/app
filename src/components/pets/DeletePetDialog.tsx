import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Pet } from '@/schemas/pets'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface DeletePetDialogProps {
  pet: Pet
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface DeletionCounts {
  healthRecords: number
  expenses: number
  reminders: number
  documents: number
}

export function DeletePetDialog({
  pet,
  open,
  onOpenChange,
  onSuccess,
}: DeletePetDialogProps) {
  const [counts, setCounts] = useState<DeletionCounts | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch deletion counts when dialog opens
  useEffect(() => {
    if (open && pet.id) {
      fetchDeletionCounts()
    } else {
      // Reset state when dialog closes
      setCounts(null)
      setError(null)
    }
  }, [open, pet.id])

  const fetchDeletionCounts = async () => {
    try {
      const countsData: DeletionCounts = {
        healthRecords: 0,
        expenses: 0,
        reminders: 0,
        documents: 0,
      }

      // Try to fetch health records count (gracefully handle if table doesn't exist)
      try {
        const { count: healthCount } = await supabase
          .from('health_records')
          .select('*', { count: 'exact', head: true })
          .eq('pet_id', pet.id)

        countsData.healthRecords = healthCount || 0
      } catch (err) {
        // Table doesn't exist yet, skip
        console.log('Health records table not yet implemented')
      }

      // Try to fetch expenses count
      try {
        const { count: expensesCount } = await supabase
          .from('expenses')
          .select('*', { count: 'exact', head: true })
          .eq('pet_id', pet.id)

        countsData.expenses = expensesCount || 0
      } catch (err) {
        console.log('Expenses table not yet implemented')
      }

      // Try to fetch reminders count
      try {
        const { count: remindersCount } = await supabase
          .from('reminders')
          .select('*', { count: 'exact', head: true })
          .eq('pet_id', pet.id)

        countsData.reminders = remindersCount || 0
      } catch (err) {
        console.log('Reminders table not yet implemented')
      }

      // Try to fetch documents count
      try {
        const { count: documentsCount } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('pet_id', pet.id)

        countsData.documents = documentsCount || 0
      } catch (err) {
        console.log('Documents table not yet implemented')
      }

      setCounts(countsData)
    } catch (err) {
      console.error('Error fetching deletion counts:', err)
      // Non-blocking - set counts to null to show basic warning
      setCounts({
        healthRecords: 0,
        expenses: 0,
        reminders: 0,
        documents: 0,
      })
    }
  }

  const extractStoragePath = (url: string): string => {
    // Extract storage path from URL
    // Example: https://xxx.supabase.co/storage/v1/object/public/pets-photos/userId/petId.jpg
    // Returns: userId/petId.jpg
    const match = url.match(/\/pets-photos\/(.+)$/)
    return match ? match[1] : ''
  }

  const deleteStorageFiles = async () => {
    const filesToDelete: string[] = []

    // Add pet photo if exists
    if (pet.photo_url) {
      const photoPath = extractStoragePath(pet.photo_url)
      if (photoPath) {
        filesToDelete.push(photoPath)
      }
    }

    // Try to fetch and delete documents if they exist
    try {
      const { data: documents } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('pet_id', pet.id)

      if (documents && documents.length > 0) {
        const docPaths = documents
          .map((d) => d.storage_path)
          .filter((path) => path != null)
        filesToDelete.push(...docPaths)
      }
    } catch (err) {
      // Documents table doesn't exist yet
      console.log('Documents table not yet implemented')
    }

    // Delete files from storage
    if (filesToDelete.length > 0) {
      try {
        const { error: storageError } = await supabase.storage
          .from('pets-photos')
          .remove(filesToDelete)

        if (storageError) {
          console.error('Failed to delete files from storage:', storageError)
          // Non-blocking error - continue with database deletion
        }
      } catch (err) {
        console.error('Storage deletion error:', err)
        // Continue with database deletion
      }
    }
  }

  const deletePet = async () => {
    if (!user) {
      throw new Error('You must be logged in to delete a pet')
    }

    const { error: deleteError } = await supabase
      .from('pets')
      .delete()
      .eq('id', pet.id)
      .eq('user_id', user.id) // RLS enforcement

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      throw new Error('Failed to delete pet from database')
    }

    // CASCADE DELETE will automatically delete:
    // - health_records
    // - expenses
    // - reminders
    // - documents
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      // Step 1: Delete storage files (photos and documents)
      await deleteStorageFiles()

      // Step 2: Delete pet from database (cascade to related records)
      await deletePet()

      // Step 3: Success - trigger callback
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to delete pet:', err)

      if (err instanceof Error) {
        // Check for specific error types
        if (err.message.includes('row-level security')) {
          setError("You don't have permission to delete this pet.")
        } else {
          setError(`Failed to delete ${pet.name}. Please try again.`)
        }
      } else {
        setError(`Failed to delete ${pet.name}. Please try again.`)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const totalItems =
    (counts?.healthRecords || 0) +
    (counts?.expenses || 0) +
    (counts?.reminders || 0) +
    (counts?.documents || 0)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete {pet.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              This will permanently delete <strong>{pet.name}</strong> and all
              associated health records, expenses, reminders, and documents.
              This cannot be undone.
            </p>

            {/* Loading counts */}
            {counts === null && (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading deletion details...</span>
              </div>
            )}

            {/* Display counts if available and items exist */}
            {counts && totalItems > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="font-semibold text-sm mb-2">This will delete:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {counts.healthRecords > 0 && (
                    <li>
                      {counts.healthRecords} health record
                      {counts.healthRecords !== 1 ? 's' : ''}
                    </li>
                  )}
                  {counts.expenses > 0 && (
                    <li>
                      {counts.expenses} expense
                      {counts.expenses !== 1 ? 's' : ''}
                    </li>
                  )}
                  {counts.reminders > 0 && (
                    <li>
                      {counts.reminders} reminder
                      {counts.reminders !== 1 ? 's' : ''}
                    </li>
                  )}
                  {counts.documents > 0 && (
                    <li>
                      {counts.documents} document
                      {counts.documents !== 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              `Yes, delete ${pet.name}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
