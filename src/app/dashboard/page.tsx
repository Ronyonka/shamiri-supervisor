import prisma from "@/lib/prisma"
import { SessionTable } from "@/components/SessionTable"
import { Header } from "@/components/Header"
import { SummaryCards } from "@/components/SummaryCards"
import { getDisplayStatus } from "@/lib/sessionStatus"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const sessions = await prisma.session.findMany({
    include: {
      fellow: true,
      group: true,
      analysis: true,
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      date: "desc",
    },
  })

  // Calculate summary stats
  const stats = sessions.reduce(
    (acc, session) => {
      const status = getDisplayStatus(session)
      if (status === "FLAGGED_FOR_REVIEW") acc.flagged++
      if (status === "PROCESSED" || status === "SAFE") acc.processed++
      return acc
    },
    { flagged: 0, processed: 0 }
  )

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Header />
      
      <main className="container mx-auto py-8 space-y-8 px-4 md:px-6">
        <div className="flex flex-col space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#1a3a2a]">Supervisor Overview</h2>
          <p className="text-slate-500 text-sm">Reviewing {sessions.length} sessions across all fellows.</p>
        </div>
        
        <SummaryCards 
          total={sessions.length} 
          flagged={stats.flagged} 
          processed={stats.processed} 
        />

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Recent Sessions</h3>
          </div>
          <SessionTable sessions={sessions} />
        </div>
      </main>
    </div>
  )
}
