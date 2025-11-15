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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MedicationFieldsProps {
  register: any
  control: Control<any>
  errors: FieldErrors<any>
  isLoading: boolean
  dateValue: string
  startDateValue?: string | null
  endDateValue?: string | null
  frequencyValue?: string | null
  onDateChange: (date: string) => void
  onStartDateChange: (date: string | null) => void
  onEndDateChange: (date: string | null) => void
  onFrequencyChange: (frequency: string | null) => void
}

export function MedicationFields({
  register,
  errors,
  isLoading,
  dateValue,
  startDateValue,
  endDateValue,
  frequencyValue,
  onDateChange,
  onStartDateChange,
  onEndDateChange,
  onFrequencyChange,
}: MedicationFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Title (required) */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Medication Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Amoxicillin, Prednisone"
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
          Record Date <span className="text-red-500">*</span>
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

      {/* Dosage (optional) */}
      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage (Optional)</Label>
        <Input
          id="dosage"
          placeholder="e.g., 10mg, 2ml, 1 tablet"
          {...register('dosage')}
          disabled={isLoading}
        />
        {errors.dosage && (
          <p className="text-sm text-red-500">{errors.dosage.message?.toString()}</p>
        )}
      </div>

      {/* Frequency (dropdown - optional) */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency (Optional)</Label>
        <Select
          value={frequencyValue || ''}
          onValueChange={(value) => onFrequencyChange(value || null)}
          disabled={isLoading}
        >
          <SelectTrigger id="frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="twice-daily">Twice Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="as-needed">As Needed</SelectItem>
          </SelectContent>
        </Select>
        {frequencyValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFrequencyChange(null)}
            disabled={isLoading}
          >
            Clear frequency
          </Button>
        )}
        {errors.frequency && (
          <p className="text-sm text-red-500">{errors.frequency.message?.toString()}</p>
        )}
      </div>

      {/* Start Date (optional) */}
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {startDateValue
                ? format(new Date(startDateValue), 'PPP')
                : 'Select start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={startDateValue ? new Date(startDateValue) : undefined}
              onSelect={(date) =>
                onStartDateChange(date ? format(date, 'yyyy-MM-dd') : null)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {startDateValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onStartDateChange(null)}
            disabled={isLoading}
          >
            Clear date
          </Button>
        )}
        {errors.start_date && (
          <p className="text-sm text-red-500">{errors.start_date.message?.toString()}</p>
        )}
      </div>

      {/* End Date (optional, must be >= start date) */}
      <div className="space-y-2">
        <Label htmlFor="end_date">End Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {endDateValue
                ? format(new Date(endDateValue), 'PPP')
                : 'Select end date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={endDateValue ? new Date(endDateValue) : undefined}
              onSelect={(date) =>
                onEndDateChange(date ? format(date, 'yyyy-MM-dd') : null)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {endDateValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEndDateChange(null)}
            disabled={isLoading}
          >
            Clear date
          </Button>
        )}
        {errors.end_date && (
          <p className="text-sm text-red-500">{errors.end_date.message?.toString()}</p>
        )}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this medication"
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
