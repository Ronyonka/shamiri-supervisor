import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "SAFE":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium px-2.5 py-0.5"
        >
          Safe
        </Badge>
      )
    case "PROCESSED":
      return (
        <Badge
          variant="secondary"
          className="bg-slate-100/80 text-slate-600 border-slate-200 font-medium px-2.5 py-0.5"
        >
          Processed
        </Badge>
      )
    case "FLAGGED_FOR_REVIEW":
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-100 font-semibold gap-1.5 py-1 px-3"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Flagged for Review
        </Badge>
      )
    case "RISK":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-semibold gap-1.5 py-1 px-3"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Clinical Risk
        </Badge>
      )
    case "MISSING_ANALYSIS":
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-500 hover:bg-gray-200 gap-1.5 px-2.5 py-0.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Pending Analysis
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="font-medium px-2.5 py-0.5">
          {status}
        </Badge>
      )
  }
}
