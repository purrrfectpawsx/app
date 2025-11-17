import { memo } from 'react'
import { format } from 'date-fns'
import { Syringe, Pill, Stethoscope, AlertCircle, Scale, ChevronDown, ChevronUp , Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HealthRecord, HealthRecordType } from '@/types/healthRecords'
import {
  formatVaccineDetails,
  formatMedicationDetails,
  formatVetVisitDetails,
  formatSymptomDetails,
  formatWeightDetails,
} from '@/utils/healthRecordFormatters'

interface HealthRecordCardProps {
  record: HealthRecord
  isExpanded?: boolean
  onToggleExpand?: () => void
  onEdit?: (record: HealthRecord) => void
  isOverdue?: boolean
}

// Icon mapping for each record type
const iconMap: Record<HealthRecordType, React.ElementType> = {
  vaccine: Syringe,
  medication: Pill,
  vet_visit: Stethoscope,
  symptom: AlertCircle,
  weight_check: Scale,
}

// Color styling for each record type
const colorStyles: Record<HealthRecordType, string> = {
  vaccine: 'border-blue-500 bg-blue-50 text-blue-700',
  medication: 'border-purple-500 bg-purple-50 text-purple-700',
  vet_visit: 'border-green-500 bg-green-50 text-green-700',
  symptom: 'border-orange-500 bg-orange-50 text-orange-700',
  weight_check: 'border-teal-500 bg-teal-50 text-teal-700',
}

// Overdue vaccine styling
const overdueStyles = 'border-red-500 bg-red-50 text-red-700'

export const HealthRecordCard = memo(function HealthRecordCard({
  record,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  isOverdue = false,
}: HealthRecordCardProps) {
  const Icon = iconMap[record.record_type]

  // Determine styling - overdue vaccines get special treatment
  const cardStyles = isOverdue ? overdueStyles : colorStyles[record.record_type]

  // Format key details based on record type
  const getKeyDetails = () => {
    switch (record.record_type) {
      case 'vaccine':
        return formatVaccineDetails(record.vaccine_data)
      case 'medication':
        return formatMedicationDetails(record.medication_data)
      case 'vet_visit':
        return formatVetVisitDetails(record.vet_visit_data)
      case 'symptom':
        return formatSymptomDetails(record.symptom_data)
      case 'weight_check':
        return formatWeightDetails(record.weight_data)
      default:
        return ''
    }
  }

  const keyDetails = getKeyDetails()

  // Format the date
  const formattedDate = format(new Date(record.date), 'MMM d, yyyy')

  return (
    <div
      className={cn(
        'border-2 rounded-lg p-4 transition-all',
        cardStyles,
        onToggleExpand && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onToggleExpand}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={cn('w-12 h-12 rounded-md flex items-center justify-center', cardStyles)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{record.title}</h3>
                {isOverdue && (
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-full">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{formattedDate}</p>
            </div>

            {/* Expand/Collapse Icon */}
            {onToggleExpand && (
              <button
                className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand()
                }}
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Key Details Preview */}
          {keyDetails && !isExpanded && (
            <p className="text-sm mt-2">{keyDetails}</p>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-current/20 space-y-3">
              {/* Record type label */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                  Record Type
                </p>
                <p className="text-sm mt-0.5 capitalize">
                  {record.record_type.replace('_', ' ')}
                </p>
              </div>

              {/* Key details in expanded view */}
              {keyDetails && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                    Details
                  </p>
                  <p className="text-sm mt-0.5">{keyDetails}</p>
                </div>
              )}

              {/* Notes */}
              {record.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                    Notes
                  </p>
                  <p className="text-sm mt-0.5">{record.notes}</p>
                </div>
              )}

              {/* Type-specific fields in detail */}
              {record.record_type === 'vaccine' && record.vaccine_data && (
                <div className="space-y-2">
                  {record.vaccine_data.expiration_date && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Expiration Date
                      </p>
                      <p className="text-sm mt-0.5">
                        {format(new Date(record.vaccine_data.expiration_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {record.vaccine_data.vet_clinic && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Vet Clinic
                      </p>
                      <p className="text-sm mt-0.5">{record.vaccine_data.vet_clinic}</p>
                    </div>
                  )}
                  {record.vaccine_data.dose && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Dose
                      </p>
                      <p className="text-sm mt-0.5">{record.vaccine_data.dose}</p>
                    </div>
                  )}
                </div>
              )}

              {record.record_type === 'medication' && record.medication_data && (
                <div className="space-y-2">
                  {record.medication_data.dosage && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Dosage
                      </p>
                      <p className="text-sm mt-0.5">{record.medication_data.dosage}</p>
                    </div>
                  )}
                  {record.medication_data.frequency && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Frequency
                      </p>
                      <p className="text-sm mt-0.5">{record.medication_data.frequency}</p>
                    </div>
                  )}
                  {record.medication_data.start_date && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Start Date
                      </p>
                      <p className="text-sm mt-0.5">
                        {format(new Date(record.medication_data.start_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {record.medication_data.end_date && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        End Date
                      </p>
                      <p className="text-sm mt-0.5">
                        {format(new Date(record.medication_data.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {record.record_type === 'vet_visit' && record.vet_visit_data && (
                <div className="space-y-2">
                  {record.vet_visit_data.clinic && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Clinic
                      </p>
                      <p className="text-sm mt-0.5">{record.vet_visit_data.clinic}</p>
                    </div>
                  )}
                  {record.vet_visit_data.vet_name && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Veterinarian
                      </p>
                      <p className="text-sm mt-0.5">Dr. {record.vet_visit_data.vet_name}</p>
                    </div>
                  )}
                  {record.vet_visit_data.diagnosis && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Diagnosis
                      </p>
                      <p className="text-sm mt-0.5">{record.vet_visit_data.diagnosis}</p>
                    </div>
                  )}
                  {record.vet_visit_data.treatment && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Treatment
                      </p>
                      <p className="text-sm mt-0.5">{record.vet_visit_data.treatment}</p>
                    </div>
                  )}
                  {record.vet_visit_data.cost !== null && record.vet_visit_data.cost !== undefined && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Cost
                      </p>
                      <p className="text-sm mt-0.5">${record.vet_visit_data.cost.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}

              {record.record_type === 'symptom' && record.symptom_data && (
                <div className="space-y-2">
                  {record.symptom_data.severity && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Severity
                      </p>
                      <p className="text-sm mt-0.5 capitalize">{record.symptom_data.severity}</p>
                    </div>
                  )}
                  {record.symptom_data.observed_behaviors && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Observed Behaviors
                      </p>
                      <p className="text-sm mt-0.5">{record.symptom_data.observed_behaviors}</p>
                    </div>
                  )}
                </div>
              )}

              {record.record_type === 'weight_check' && record.weight_data && (
                <div className="space-y-2">
                  {record.weight_data.weight !== null && record.weight_data.weight !== undefined && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Weight
                      </p>
                      <p className="text-sm mt-0.5">
                        {record.weight_data.weight} {record.weight_data.unit || 'lbs'}
                      </p>
                    </div>
                  )}
                  {record.weight_data.body_condition && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                        Body Condition
                      </p>
                      <p className="text-sm mt-0.5">{record.weight_data.body_condition}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Edit/Delete buttons */}
              <div className="flex gap-2 pt-2">
                {onEdit && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/50 hover:bg-white rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(record)
                    }}
                    aria-label="Edit health record"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/50 hover:bg-white rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Story 3.8 - Delete functionality
                    console.log('Delete record:', record.id)
                  }}
                  aria-label="Delete health record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
