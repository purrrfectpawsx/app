import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

import {
  vaccineRecordSchema,
  medicationRecordSchema,
  vetVisitRecordSchema,
  symptomRecordSchema,
  weightCheckRecordSchema,
  type VaccineFormData,
  type MedicationFormData,
  type VetVisitFormData,
  type SymptomFormData,
  type WeightCheckFormData,
} from '@/schemas/healthRecords'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VaccineFields } from './VaccineFields'
import { MedicationFields } from './MedicationFields'
import { VetVisitFields } from './VetVisitFields'
import { SymptomFields } from './SymptomFields'
import { WeightCheckFields } from './WeightCheckFields'
import { useToast } from '@/hooks/use-toast'

interface CreateHealthRecordFormProps {
  petId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const recordTypeOptions = [
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'medication', label: 'Medication' },
  { value: 'vet_visit', label: 'Vet Visit' },
  { value: 'symptom', label: 'Symptom' },
  { value: 'weight_check', label: 'Weight Check' },
] as const

type RecordType = 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight_check'
type AllFormData = VaccineFormData | MedicationFormData | VetVisitFormData | SymptomFormData | WeightCheckFormData

export function CreateHealthRecordForm({
  petId,
  onSuccess,
  onCancel,
}: CreateHealthRecordFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecordType, setSelectedRecordType] = useState<RecordType>('vaccine')
  const { user } = useAuth()
  const { toast } = useToast()

  // Get the appropriate schema based on selected record type
  const getSchema = (type: RecordType) => {
    switch (type) {
      case 'vaccine':
        return vaccineRecordSchema
      case 'medication':
        return medicationRecordSchema
      case 'vet_visit':
        return vetVisitRecordSchema
      case 'symptom':
        return symptomRecordSchema
      case 'weight_check':
        return weightCheckRecordSchema
      default:
        return vaccineRecordSchema
    }
  }

  // Get default values based on record type
  const getDefaultValues = (type: RecordType) => {
    const baseDefaults = {
      record_type: type,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: null,
    }

    switch (type) {
      case 'vaccine':
        return {
          ...baseDefaults,
          title: '',
          expiration_date: null,
          vet_clinic: null,
          dose: null,
        }
      case 'medication':
        return {
          ...baseDefaults,
          title: '',
          dosage: null,
          frequency: null,
          start_date: null,
          end_date: null,
        }
      case 'vet_visit':
        return {
          ...baseDefaults,
          title: '',
          clinic: null,
          vet_name: null,
          diagnosis: null,
          treatment: null,
          cost: null,
        }
      case 'symptom':
        return {
          ...baseDefaults,
          title: '',
          severity: null,
          observed_behaviors: null,
        }
      case 'weight_check':
        return {
          ...baseDefaults,
          weight: undefined,
          unit: 'kg', // default to kg
          body_condition: null,
        }
      default:
        return baseDefaults
    }
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AllFormData>({
    resolver: zodResolver(getSchema(selectedRecordType)) as any,
    mode: 'onChange',
    defaultValues: getDefaultValues(selectedRecordType) as any,
  })

  // Watch all field values
  const dateValue = watch('date')
  const expirationDateValue = watch('expiration_date' as any)
  const startDateValue = watch('start_date' as any)
  const endDateValue = watch('end_date' as any)
  const frequencyValue = watch('frequency' as any)
  const severityValue = watch('severity' as any)
  const unitValue = watch('unit' as any)
  const bodyConditionValue = watch('body_condition' as any)

  // Reset form when record type changes
  useEffect(() => {
    reset(getDefaultValues(selectedRecordType) as any)
  }, [selectedRecordType, reset])

  const onSubmit = async (data: AllFormData) => {
    if (!user) {
      setError('You must be logged in to create health records')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let insertData: any = {
        pet_id: petId,
        user_id: user.id,
        record_type: selectedRecordType,
        date: data.date,
        notes: data.notes || null,
      }

      // Add type-specific fields
      switch (selectedRecordType) {
        case 'vaccine': {
          const vaccineData = data as VaccineFormData
          insertData.title = vaccineData.title
          insertData.vaccine_data = {
            expiration_date: vaccineData.expiration_date || null,
            vet_clinic: vaccineData.vet_clinic || null,
            dose: vaccineData.dose || null,
          }
          break
        }
        case 'medication': {
          const medicationData = data as MedicationFormData
          insertData.title = medicationData.title
          insertData.medication_data = {
            dosage: medicationData.dosage || null,
            frequency: medicationData.frequency || null,
            start_date: medicationData.start_date || null,
            end_date: medicationData.end_date || null,
          }
          break
        }
        case 'vet_visit': {
          const vetVisitData = data as VetVisitFormData
          insertData.title = vetVisitData.title
          insertData.vet_visit_data = {
            clinic: vetVisitData.clinic || null,
            vet_name: vetVisitData.vet_name || null,
            diagnosis: vetVisitData.diagnosis || null,
            treatment: vetVisitData.treatment || null,
            cost: vetVisitData.cost || null,
          }
          break
        }
        case 'symptom': {
          const symptomData = data as SymptomFormData
          insertData.title = symptomData.title
          insertData.symptom_data = {
            severity: symptomData.severity || null,
            observed_behaviors: symptomData.observed_behaviors || null,
          }
          break
        }
        case 'weight_check': {
          const weightData = data as WeightCheckFormData
          insertData.title = `Weight: ${weightData.weight}${weightData.unit}` // Auto-generate title
          insertData.weight_data = {
            weight: weightData.weight,
            unit: weightData.unit,
            body_condition: weightData.body_condition || null,
          }
          break
        }
      }

      // Insert health record
      const { data: healthRecord, error: insertError } = await supabase
        .from('health_records')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(insertError.message || `Failed to save ${selectedRecordType} record`)
      }

      // Show success toast
      toast({
        title: 'Success',
        description: `${recordTypeOptions.find(opt => opt.value === selectedRecordType)?.label} record created successfully`,
      })

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error(`Error creating ${selectedRecordType} record:`, err)
      if (err instanceof Error) {
        setError(err.message)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message,
        })
      } else {
        setError('An unexpected error occurred. Please try again.')
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Get button text based on record type
  const getButtonText = () => {
    const label = recordTypeOptions.find(opt => opt.value === selectedRecordType)?.label || 'Record'
    return `Save ${label} Record`
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Record Type Selector */}
      <div className="space-y-2">
        <Label htmlFor="record_type">
          Record Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={selectedRecordType}
          onValueChange={(value) => setSelectedRecordType(value as RecordType)}
          disabled={isLoading}
        >
          <SelectTrigger id="record_type">
            <SelectValue placeholder="Select record type" />
          </SelectTrigger>
          <SelectContent>
            {recordTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Field Rendering */}
      {selectedRecordType === 'vaccine' && (
        <VaccineFields
          register={register}
          control={control}
          errors={errors}
          isLoading={isLoading}
          dateValue={dateValue}
          expirationDateValue={expirationDateValue}
          onDateChange={(date) => setValue('date', date)}
          onExpirationDateChange={(date) => setValue('expiration_date' as any, date)}
        />
      )}

      {selectedRecordType === 'medication' && (
        <MedicationFields
          register={register}
          control={control}
          errors={errors}
          isLoading={isLoading}
          dateValue={dateValue}
          startDateValue={startDateValue}
          endDateValue={endDateValue}
          frequencyValue={frequencyValue}
          onDateChange={(date) => setValue('date', date)}
          onStartDateChange={(date) => setValue('start_date' as any, date)}
          onEndDateChange={(date) => setValue('end_date' as any, date)}
          onFrequencyChange={(freq) => setValue('frequency' as any, freq)}
        />
      )}

      {selectedRecordType === 'vet_visit' && (
        <VetVisitFields
          register={register}
          control={control}
          errors={errors}
          isLoading={isLoading}
          dateValue={dateValue}
          onDateChange={(date) => setValue('date', date)}
        />
      )}

      {selectedRecordType === 'symptom' && (
        <SymptomFields
          register={register}
          control={control}
          errors={errors}
          isLoading={isLoading}
          dateValue={dateValue}
          severityValue={severityValue}
          onDateChange={(date) => setValue('date', date)}
          onSeverityChange={(severity) => setValue('severity' as any, severity)}
        />
      )}

      {selectedRecordType === 'weight_check' && (
        <WeightCheckFields
          register={register}
          control={control}
          errors={errors}
          isLoading={isLoading}
          dateValue={dateValue}
          unitValue={unitValue}
          bodyConditionValue={bodyConditionValue}
          onDateChange={(date) => setValue('date', date)}
          onUnitChange={(unit) => setValue('unit' as any, unit)}
          onBodyConditionChange={(condition) => setValue('body_condition' as any, condition)}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </div>
    </form>
  )
}
