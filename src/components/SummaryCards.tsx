import { Card, CardContent } from "@/components/ui/card"
import { Users, AlertCircle, CheckCircle2 } from "lucide-react"

interface SummaryCardsProps {
  total: number
  flagged: number
  processed: number
}

export function SummaryCards({ total, flagged, processed }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-slate-300 transition-colors"></div>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Users className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-200 group-hover:bg-amber-400 transition-colors"></div>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Flagged</p>
            <p className="text-2xl font-bold text-amber-700">{flagged}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-200 group-hover:bg-emerald-400 transition-colors"></div>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Processed</p>
            <p className="text-2xl font-bold text-emerald-700">{processed}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
