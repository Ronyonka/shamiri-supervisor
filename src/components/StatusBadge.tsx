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
          className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium"
        >
          Safe
        </Badge>
      )
    case "FLAGGED_FOR_REVIEW":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium gap-1.5"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Flagged for Review
        </Badge>
      )
    case "RISK":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 font-bold gap-1.5 pl-2 pr-3"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Risk
        </Badge>
      )
    case "MISSING_ANALYSIS":
      return (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-500 hover:bg-gray-200 gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Missing Analysis
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="font-medium">
          {status}
        </Badge>
      )
  }
}
