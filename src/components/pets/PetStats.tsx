import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Activity, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface PetStatsProps {
  petId: string
}

interface Stats {
  healthRecordsCount: number
  lastVetVisit: string | null
  totalExpenses: number
}

export function PetStats({ petId }: PetStatsProps) {
  const [stats, setStats] = useState<Stats>({
    healthRecordsCount: 0,
    lastVetVisit: null,
    totalExpenses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch health records count
        const { count: healthRecordsCount, error: countError } = await supabase
          .from('health_records')
          .select('*', { count: 'exact', head: true })
          .eq('pet_id', petId)

        if (countError) {
          console.error('Error fetching health records count:', countError)
        }

        // Fetch last vet visit date
        const { data: lastVetVisitData, error: vetError } = await supabase
          .from('health_records')
          .select('date')
          .eq('pet_id', petId)
          .eq('record_type', 'vet_visit')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (vetError) {
          console.error('Error fetching last vet visit:', vetError)
        }

        // Fetch total expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('pet_id', petId)

        if (expensesError && expensesError.code !== 'PGRST116' && expensesError.code !== 'PGRST205') {
          // PGRST116 is "relation does not exist", PGRST205 is "table not in schema cache"
          // Both expected if expenses table not created yet
          console.error('Error fetching expenses:', expensesError)
        }

        const totalExpenses = expensesData
          ? expensesData.reduce((sum, exp) => sum + (exp.amount || 0), 0)
          : 0

        setStats({
          healthRecordsCount: healthRecordsCount || 0,
          lastVetVisit: lastVetVisitData?.date || null,
          totalExpenses,
        })
      } catch (error) {
        console.error('Error fetching pet stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [petId])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Health Records Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Records</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.healthRecordsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total records tracked
          </p>
        </CardContent>
      </Card>

      {/* Last Vet Visit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Vet Visit</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.lastVetVisit
              ? format(new Date(stats.lastVetVisit), 'MMM d, yyyy')
              : 'Never'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.lastVetVisit ? 'Most recent visit' : 'No vet visits yet'}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalExpenses.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lifetime spending
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
