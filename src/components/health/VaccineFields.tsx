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

interface VaccineFieldsProps {
  register: any
  control: Control<any>
  errors: FieldErrors<any>
  isLoading: boolean
  dateValue: string
  expirationDateValue?: string | null
  onDateChange: (date: string) => void
  onExpirationDateChange: (date: string | null) => void
}

export function VaccineFields({
  register,
  errors,
  isLoading,
  dateValue,
  expirationDateValue,
  onDateChange,
  onExpirationDateChange,
}: VaccineFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Title (required) */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Vaccine Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Rabies, DHPP, Bordetella"
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
          Vaccination Date <span className="text-red-500">*</span>
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

      {/* Expiration Date (optional, must be after vaccine date) */}
      <div className="space-y-2">
        <Label htmlFor="expiration_date">Expiration Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {expirationDateValue
                ? format(new Date(expirationDateValue), 'PPP')
                : 'Select expiration date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={expirationDateValue ? new Date(expirationDateValue) : undefined}
              onSelect={(date) =>
                onExpirationDateChange(date ? format(date, 'yyyy-MM-dd') : null)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {expirationDateValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onExpirationDateChange(null)}
            disabled={isLoading}
          >
            Clear date
          </Button>
        )}
        {errors.expiration_date && (
          <p className="text-sm text-red-500">{errors.expiration_date.message?.toString()}</p>
        )}
      </div>

      {/* Vet Clinic (optional) */}
      <div className="space-y-2">
        <Label htmlFor="vet_clinic">Vet Clinic (Optional)</Label>
        <Input
          id="vet_clinic"
          placeholder="e.g., City Veterinary Clinic"
          {...register('vet_clinic')}
          disabled={isLoading}
        />
        {errors.vet_clinic && (
          <p className="text-sm text-red-500">{errors.vet_clinic.message?.toString()}</p>
        )}
      </div>

      {/* Dose (optional) */}
      <div className="space-y-2">
        <Label htmlFor="dose">Dose (Optional)</Label>
        <Input
          id="dose"
          placeholder="e.g., 1ml, single dose"
          {...register('dose')}
          disabled={isLoading}
        />
        {errors.dose && (
          <p className="text-sm text-red-500">{errors.dose.message?.toString()}</p>
        )}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this vaccination"
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
