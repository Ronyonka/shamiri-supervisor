"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/StatusBadge"
import { getDisplayStatus } from "@/lib/sessionStatus"
import { useRouter } from "next/navigation"
import type { Session, Fellow, Group, AIAnalysis, SupervisorReview } from "@/generated/prisma/client"

type SessionWithRelations = Session & {
  fellow: Fellow
  group: Group
  analysis: AIAnalysis | null
  reviews: SupervisorReview[]
}

interface SessionTableProps {
  sessions: SessionWithRelations[]
}

export function SessionTable({ sessions }: SessionTableProps) {
  const router = useRouter()

  const handleRowClick = (sessionId: string) => {
    router.push(`/dashboard/sessions/${sessionId}`)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fellow Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow
                key={session.id}
                onClick={() => handleRowClick(session.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {session.fellow.name}
                </TableCell>
                <TableCell>{session.group.name}</TableCell>
                <TableCell>{formatDate(session.date)}</TableCell>
                <TableCell>
                  <StatusBadge status={getDisplayStatus(session)} />
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="space-y-4 md:hidden">
        {sessions.map((session) => (
          <Card
            key={session.id}
            onClick={() => handleRowClick(session.id)}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{session.fellow.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.group.name}
                  </p>
                </div>
                <StatusBadge status={getDisplayStatus(session)} />
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(session.date)}
              </div>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border rounded-md border-dashed">
            No sessions found.
          </div>
        )}
      </div>
    </div>
  )
}
