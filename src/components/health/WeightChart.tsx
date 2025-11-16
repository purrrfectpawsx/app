import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { HealthRecord } from '@/types/healthRecords'

interface WeightChartProps {
  healthRecords: HealthRecord[]
  petSpecies: string
}

type DateRange = '1M' | '3M' | '6M' | '1Y' | 'All'

// Ideal weight ranges by species (in kg)
const idealWeightRanges: Record<string, { min: number; max: number } | null> = {
  dog: { min: 10, max: 30 },
  cat: { min: 3, max: 6 },
  bird: { min: 0.1, max: 1 },
  rabbit: { min: 2, max: 5 },
  other: null
}

interface WeightDataPoint {
  date: string
  weight: number
  unit: string
  bodyCondition?: string
  originalDate: Date
}

export function WeightChart({ healthRecords, petSpecies }: WeightChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('All')

  // Extract and prepare weight check data
  const weightData = useMemo(() => {
    const weightRecords = healthRecords.filter(
      (record) => record.record_type === 'weight_check'
    )

    if (weightRecords.length < 2) {
      return []
    }

    // Convert to chart data points
    const dataPoints: WeightDataPoint[] = weightRecords
      .map((record) => {
        const weightData = record.weight_data as {
          weight: number
          unit: string
          body_condition?: string
        }

        // Convert to kg for consistent charting
        let weightInKg = weightData.weight
        if (weightData.unit === 'lbs') {
          weightInKg = weightData.weight * 0.453592
        }

        return {
          date: format(new Date(record.date), 'MMM dd, yyyy'),
          weight: Number(weightInKg.toFixed(2)),
          unit: 'kg',
          bodyCondition: weightData.body_condition,
          originalDate: new Date(record.date)
        }
      })
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())

    return dataPoints
  }, [healthRecords])

  // Filter data by selected date range
  const filteredData = useMemo(() => {
    if (selectedRange === 'All' || weightData.length === 0) {
      return weightData
    }

    const now = new Date()
    const thresholds: Record<DateRange, Date> = {
      '1M': new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      '3M': new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      '6M': new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      '1Y': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      'All': new Date(0)
    }

    const threshold = thresholds[selectedRange]
    return weightData.filter((point) => point.originalDate >= threshold)
  }, [weightData, selectedRange])

  // Get ideal weight range for pet species
  const idealRange = useMemo(() => {
    const speciesKey = petSpecies.toLowerCase()
    return idealWeightRanges[speciesKey] || idealWeightRanges.other
  }, [petSpecies])

  // Check if there are mixed units in original data
  const hasMixedUnits = useMemo(() => {
    const weightRecords = healthRecords.filter(
      (record) => record.record_type === 'weight_check'
    )
    const units = new Set(
      weightRecords.map((r) => (r.weight_data as { unit: string }).unit)
    )
    return units.size > 1
  }, [healthRecords])

  // Custom dot with body condition color coding
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    const bodyCondition = payload.bodyCondition

    const colorMap: Record<string, string> = {
      underweight: '#3b82f6', // blue
      ideal: '#22c55e', // green
      overweight: '#eab308', // yellow
    }

    const color = bodyCondition ? colorMap[bodyCondition.toLowerCase()] || '#6b7280' : '#6b7280'

    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WeightDataPoint
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{data.date}</p>
          <p className="text-sm text-gray-600">
            Weight: {data.weight} {data.unit}
          </p>
          {data.bodyCondition && (
            <p className="text-sm text-gray-600 capitalize">
              Condition: {data.bodyCondition}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Empty state
  if (weightData.length < 2) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Weight Chart</h3>
        <p className="text-gray-600 mb-4">
          Add at least 2 weight records to see the weight tracking chart
        </p>
        <Button variant="outline" size="sm">
          Add Weight Check
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header with title and date range selector */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Weight Chart
              {hasMixedUnits && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (converted to kg)
                </span>
              )}
            </h3>
          </div>

          {/* Date range selector */}
          <div className="flex gap-2">
            {(['1M', '3M', '6M', '1Y', 'All'] as DateRange[]).map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(range)}
                className="min-w-[50px]"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend for body condition colors */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">Body Condition:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span>Underweight</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            <span>Ideal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
            <span>Overweight</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#6b7280]"></div>
            <span>Not specified</span>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" aspect={2}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              label={{
                value: 'Weight (kg)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#6b7280' }
              }}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Ideal weight range shaded area */}
            {idealRange && (
              <ReferenceArea
                y1={idealRange.min}
                y2={idealRange.max}
                fill="#22c55e"
                fillOpacity={0.1}
                strokeOpacity={0}
              />
            )}

            {/* Weight line */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
