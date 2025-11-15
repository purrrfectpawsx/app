import { Control, FieldErrors } from 'react-hook-form'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface VetVisitFieldsProps {
  register: any
  control: Control<any>
  errors: FieldErrors<any>
  isLoading: boolean
  dateValue: string
  onDateChange: (date: string) => void
}

export function VetVisitFields({
  register,
  errors,
  isLoading,
  dateValue,
  onDateChange,
}: VetVisitFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Title (required) */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Visit Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Annual Checkup, Emergency Visit"
          {...register('title')}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message?.toString()}</p>
        )}
      </div>

      {/* Date (required, defaults to today) */}
      <div className="space-y-2">
        <Label htmlFor="date">
          Visit Date <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateValue ? format(new Date(dateValue), 'PPP') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateValue ? new Date(dateValue) : undefined}
              onSelect={(date) =>
                onDateChange(date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message?.toString()}</p>
        )}
      </div>

      {/* Clinic (optional) */}
      <div className="space-y-2">
        <Label htmlFor="clinic">Clinic Name (Optional)</Label>
        <Input
          id="clinic"
          placeholder="e.g., City Veterinary Clinic"
          {...register('clinic')}
          disabled={isLoading}
        />
        {errors.clinic && (
          <p className="text-sm text-red-500">{errors.clinic.message?.toString()}</p>
        )}
      </div>

      {/* Vet Name (optional) */}
      <div className="space-y-2">
        <Label htmlFor="vet_name">Vet Name (Optional)</Label>
        <Input
          id="vet_name"
          placeholder="e.g., Dr. Smith"
          {...register('vet_name')}
          disabled={isLoading}
        />
        {errors.vet_name && (
          <p className="text-sm text-red-500">{errors.vet_name.message?.toString()}</p>
        )}
      </div>

      {/* Diagnosis (optional) */}
      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
        <Textarea
          id="diagnosis"
          placeholder="Diagnosis or findings from the visit"
          rows={3}
          {...register('diagnosis')}
          disabled={isLoading}
          className="resize-none"
        />
        {errors.diagnosis && (
          <p className="text-sm text-red-500">{errors.diagnosis.message?.toString()}</p>
        )}
      </div>

      {/* Treatment (optional) */}
      <div className="space-y-2">
        <Label htmlFor="treatment">Treatment (Optional)</Label>
        <Textarea
          id="treatment"
          placeholder="Treatment or medications prescribed"
          rows={3}
          {...register('treatment')}
          disabled={isLoading}
          className="resize-none"
        />
        {errors.treatment && (
          <p className="text-sm text-red-500">{errors.treatment.message?.toString()}</p>
        )}
      </div>

      {/* Cost (optional, positive numbers only) */}
      <div className="space-y-2">
        <Label htmlFor="cost">Cost (Optional)</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 150.00"
          {...register('cost', {
            setValueAs: (v: string) => v === '' ? null : parseFloat(v)
          })}
          disabled={isLoading}
        />
        {errors.cost && (
          <p className="text-sm text-red-500">{errors.cost.message?.toString()}</p>
        )}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this visit"
          rows={3}
          {...register('notes')}
          disabled={isLoading}
          className="resize-none"
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message?.toString()}</p>
        )}
      </div>
    </div>
  )
}
