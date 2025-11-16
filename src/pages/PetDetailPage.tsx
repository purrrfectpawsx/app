import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react'

import { usePets } from '@/hooks/usePets'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PetInfoCard } from '@/components/pets/PetInfoCard'
import { PetStats } from '@/components/pets/PetStats'
import { DeletePetDialog } from '@/components/pets/DeletePetDialog'
import { CreateHealthRecordForm } from '@/components/health/CreateHealthRecordForm'
import { HealthTimeline } from '@/components/health/HealthTimeline'
import { TimelineFilters, type FilterType } from '@/components/health/TimelineFilters'
import { WeightChart } from '@/components/health/WeightChart'
import type { HealthRecord } from '@/types/healthRecords'
import type { Pet } from '@/schemas/pets'
import { CreatePetForm } from '@/components/pets/CreatePetForm'

export function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { getPetById, isLoading } = usePets()
  const [pet, setPet] = useState<Pet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [healthRecordDialogOpen, setHealthRecordDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [timelineKey, setTimelineKey] = useState(0)
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all'])
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])

  const fetchPet = async () => {
    if (!petId) {
      setError('Pet ID is required')
      return
    }

    try {
      const fetchedPet = await getPetById(petId)
      if (!fetchedPet) {
        setError('Pet not found')
      } else {
        setPet(fetchedPet)
      }
    } catch (err) {
      console.error('Error fetching pet:', err)
      setError('Failed to load pet details')
    }
  }

  useEffect(() => {
    fetchPet()
  }, [petId, getPetById])

  // Show success message from location state (e.g., after redirect from deletion)
  useEffect(() => {
    const state = location.state as { message?: string }
    if (state?.message) {
      setSuccessMessage(state.message)
      // Clear state after showing message
      navigate(location.pathname, { replace: true, state: {} })

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    }
  }, [location, navigate])

  const handleBack = () => {
    navigate('/pets')
  }

  const handleEdit = () => {
    setEditDialogOpen(true)
  }

  const handleEditSuccess = async () => {
    setEditDialogOpen(false)
    // Refetch pet data to show updates
    await fetchPet()
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    // Navigate to pets grid with success message
    navigate('/pets', {
      state: { message: `${pet?.name || 'Pet'} has been deleted` },
    })
  }

  const handleAddHealthRecord = () => {
    setHealthRecordDialogOpen(true)
  }

  const handleHealthRecordSuccess = () => {
    setHealthRecordDialogOpen(false)
    // Refresh timeline by changing key
    setTimelineKey((prev) => prev + 1)
  }

  const handleRecordsLoaded = (records: HealthRecord[]) => {
    setHealthRecords(records)
  }

  const handleFilterChange = (newFilters: FilterType[]) => {
    setActiveFilters(newFilters)
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>

          {/* Info card skeleton */}
          <Skeleton className="h-96 rounded-lg" />

          {/* Tabs skeleton */}
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || 'Pet not found'}
          </h2>
          <p className="text-gray-600">
            The pet you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Success message banner */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Header with Back and Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBack} aria-label="Back to pets">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-600 mt-1 capitalize">
                {pet.species}
                {pet.breed && ` • ${pet.breed}`}
              </p>
            </div>
          </div>

          {/* Edit and Delete buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <PetStats petId={pet.id} />

        {/* Pet Information Card */}
        <PetInfoCard pet={pet} />

        {/* Tabs Navigation */}
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-6">
            <div className="space-y-4">
              {/* Add Health Record Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Health Timeline</h2>
                <Button onClick={handleAddHealthRecord}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Health Record
                </Button>
              </div>

              {/* Timeline Filters */}
              <TimelineFilters
                healthRecords={healthRecords}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />

              {/* Weight Chart */}
              <WeightChart healthRecords={healthRecords} petSpecies={pet.species} />

              {/* Health Timeline */}
              <HealthTimeline
                key={timelineKey}
                petId={pet.id}
                onAddRecord={handleAddHealthRecord}
                activeFilters={activeFilters}
                onRecordsLoaded={handleRecordsLoaded}
              />
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-gray-500">
                Expense tracking will be available in Epic 4.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="mt-6">
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-gray-500">
                Reminders will be available in Epic 5.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-gray-500">
                Document storage will be available in Epic 6.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Pet Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {pet.name}'s Profile</DialogTitle>
            </DialogHeader>
            <CreatePetForm
              mode="edit"
              initialData={pet}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Pet Dialog */}
        <DeletePetDialog
          pet={pet}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />

        {/* Add Health Record Dialog */}
        <Dialog open={healthRecordDialogOpen} onOpenChange={setHealthRecordDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Health Record for {pet.name}</DialogTitle>
            </DialogHeader>
            <CreateHealthRecordForm
              petId={pet.id}
              onSuccess={handleHealthRecordSuccess}
              onCancel={() => setHealthRecordDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
