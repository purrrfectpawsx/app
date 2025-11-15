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

interface SymptomFieldsProps {
  register: any
  control: Control<any>
  errors: FieldErrors<any>
  isLoading: boolean
  dateValue: string
  severityValue?: string | null
  onDateChange: (date: string) => void
  onSeverityChange: (severity: string | null) => void
}

export function SymptomFields({
  register,
  errors,
  isLoading,
  dateValue,
  severityValue,
  onDateChange,
  onSeverityChange,
}: SymptomFieldsProps) {
  // Get severity color for visual indicator
  const getSeverityColor = (severity: string | null | undefined) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'moderate':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'severe':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Title (required) */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Symptom Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Vomiting, Lethargy, Limping"
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
          Date Observed <span className="text-red-500">*</span>
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

      {/* Severity (dropdown - optional with visual indicator) */}
      <div className="space-y-2">
        <Label htmlFor="severity">Severity (Optional)</Label>
        <Select
          value={severityValue || ''}
          onValueChange={(value) => onSeverityChange(value || null)}
          disabled={isLoading}
        >
          <SelectTrigger id="severity" className={getSeverityColor(severityValue)}>
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mild">Mild</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="severe">Severe</SelectItem>
          </SelectContent>
        </Select>
        {severityValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSeverityChange(null)}
            disabled={isLoading}
          >
            Clear severity
          </Button>
        )}
        {errors.severity && (
          <p className="text-sm text-red-500">{errors.severity.message?.toString()}</p>
        )}
      </div>

      {/* Observed Behaviors (textarea - optional) */}
      <div className="space-y-2">
        <Label htmlFor="observed_behaviors">Observed Behaviors (Optional)</Label>
        <Textarea
          id="observed_behaviors"
          placeholder="Describe the behaviors you observed related to this symptom"
          rows={4}
          {...register('observed_behaviors')}
          disabled={isLoading}
          className="resize-none"
        />
        {errors.observed_behaviors && (
          <p className="text-sm text-red-500">{errors.observed_behaviors.message?.toString()}</p>
        )}
      </div>

      {/* Notes (optional) */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this symptom"
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
