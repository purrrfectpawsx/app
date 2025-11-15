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

interface WeightCheckFieldsProps {
  register: any
  control: Control<any>
  errors: FieldErrors<any>
  isLoading: boolean
  dateValue: string
  unitValue?: string | null
  bodyConditionValue?: string | null
  onDateChange: (date: string) => void
  onUnitChange: (unit: string) => void
  onBodyConditionChange: (condition: string | null) => void
}

export function WeightCheckFields({
  register,
  errors,
  isLoading,
  dateValue,
  unitValue,
  bodyConditionValue,
  onDateChange,
  onUnitChange,
  onBodyConditionChange,
}: WeightCheckFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Date (required, defaults to today) */}
      <div className="space-y-2">
        <Label htmlFor="date">
          Date <span className="text-red-500">*</span>
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

      {/* Weight (required, positive numbers only) */}
      <div className="space-y-2">
        <Label htmlFor="weight">
          Weight <span className="text-red-500">*</span>
        </Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g., 12.5"
          {...register('weight', {
            setValueAs: (v: string) => v === '' ? undefined : parseFloat(v)
          })}
          disabled={isLoading}
        />
        {errors.weight && (
          <p className="text-sm text-red-500">{errors.weight.message?.toString()}</p>
        )}
      </div>

      {/* Unit (dropdown - required) */}
      <div className="space-y-2">
        <Label htmlFor="unit">
          Unit <span className="text-red-500">*</span>
        </Label>
        <Select
          value={unitValue || ''}
          onValueChange={onUnitChange}
          disabled={isLoading}
        >
          <SelectTrigger id="unit">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">Kilograms (kg)</SelectItem>
            <SelectItem value="lbs">Pounds (lbs)</SelectItem>
          </SelectContent>
        </Select>
        {errors.unit && (
          <p className="text-sm text-red-500">{errors.unit.message?.toString()}</p>
        )}
      </div>

      {/* Body Condition (dropdown - optional) */}
      <div className="space-y-2">
        <Label htmlFor="body_condition">Body Condition (Optional)</Label>
        <Select
          value={bodyConditionValue || ''}
          onValueChange={(value) => onBodyConditionChange(value || null)}
          disabled={isLoading}
        >
          <SelectTrigger id="body_condition">
            <SelectValue placeholder="Select body condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="underweight">Underweight</SelectItem>
            <SelectItem value="ideal">Ideal</SelectItem>
            <SelectItem value="overweight">Overweight</SelectItem>
          </SelectContent>
        </Select>
        {bodyConditionValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onBodyConditionChange(null)}
            disabled={isLoading}
          >
            Clear condition
          </Button>
        )}
        {errors.body_condition && (
          <p className="text-sm text-red-500">{errors.body_condition.message?.toString()}</p>
        )}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this weight check"
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
