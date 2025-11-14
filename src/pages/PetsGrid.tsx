import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

import { usePets } from '@/hooks/usePets'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PetCard } from '@/components/pets/PetCard'
import { EmptyPetsState } from '@/components/pets/EmptyPetsState'
import { CreatePetForm } from '@/components/pets/CreatePetForm'
import { UpgradePromptDialog } from '@/components/subscription/UpgradePromptDialog'
import { TierLimitBanner } from '@/components/subscription/TierLimitBanner'
import { PetUsageIndicator } from '@/components/subscription/PetUsageIndicator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Pet } from '@/schemas/pets'

export function PetsGrid() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free')
  const { getAllPets, isLoading } = usePets()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const fetchPets = useCallback(async () => {
    try {
      setError(null)
      const fetchedPets = await getAllPets()
      setPets(fetchedPets)
    } catch (err) {
      console.error('Error fetching pets:', err)
      setError('Failed to load pets. Please try again.')
    }
  }, [getAllPets])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])
  const fetchSubscriptionTier = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching subscription tier:', error)
        return
      }

      setSubscriptionTier(data?.subscription_tier || 'free')
    } catch (err) {
      console.error('Error fetching subscription tier:', err)
    }
  }, [user])

  useEffect(() => {
    fetchSubscriptionTier()
  }, [fetchSubscriptionTier])
  // Show success message from location state (e.g., after pet deletion)
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


  const handleAddPet = () => {
    // Check if free tier user has reached pet limit
    if (subscriptionTier === 'free' && pets.length >= 1) {
      setShowUpgradePrompt(true)
      return
    }

    setDialogKey(prev => prev + 1)
    setIsDialogOpen(true)
  }

  const handlePetCreated = (petId: string) => {
    // Refresh pets list
    fetchPets()
    // Navigate without closing dialog - success message displays for 2s in CreatePetForm
    // Dialog will unmount naturally when navigation occurs
    navigate(`/pets/${petId}`)
  }

  // Loading state with skeleton cards
  if (isLoading && pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-gray-900">Oops!</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchPets}>Retry</Button>
        </div>
      </div>
    )
  }

  // Shared dialog component
  const petDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Pet Profile</DialogTitle>
        </DialogHeader>
        {isDialogOpen && (
          <CreatePetForm
            key={dialogKey}
            onSuccess={handlePetCreated}
            onCancel={() => setIsDialogOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )

  // Empty state
  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {petDialog}
        <div className="max-w-7xl mx-auto p-6">
          {/* Success message banner */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center justify-between mb-6">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <EmptyPetsState onAddPet={handleAddPet} />
      </div>
    )
  }

  // Grid with pets
  return (
    <div className="min-h-screen bg-gray-50">
      {petDialog}

      <div className="max-w-7xl mx-auto p-6">
        {/* Success message banner */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center justify-between mb-6">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Tier Limit Banner */}
        <TierLimitBanner show={subscriptionTier === 'free' && pets.length >= 1} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Pets {pets.length > 0 && `(${pets.length})`}
          </h1>
          <div className="flex items-center gap-4">
            <PetUsageIndicator
              petCount={pets.length}
              subscriptionTier={subscriptionTier}
            />
            <Button onClick={handleAddPet}>
              <Plus className="mr-2 h-4 w-4" />
              Add Pet
            </Button>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      </div>

      {/* Upgrade Prompt Dialog */}
      <UpgradePromptDialog
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        feature="pets"
      />
    </div>
  )
}
