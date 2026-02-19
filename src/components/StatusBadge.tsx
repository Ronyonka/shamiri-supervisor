import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { SessionStatus } from "@/generated/prisma/enums"

interface StatusBadgeProps {
  status: SessionStatus | string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case SessionStatus.SAFE:
      return (
        <Badge 
          variant="outline" 
          className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium"
        >
          Safe
        </Badge>
      )
    case SessionStatus.PROCESSED:
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium"
        >
          Processed
        </Badge>
      )
    case SessionStatus.FLAGGED:
      return (
        <Badge 
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 font-bold gap-1.5 pl-2 pr-3"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Flagged for Review
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
