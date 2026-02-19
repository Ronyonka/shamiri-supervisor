import prisma from "@/lib/prisma"
import { SessionTable } from "@/components/SessionTable"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const sessions = await prisma.session.findMany({
    include: {
      fellow: true,
      group: true,
      analysis: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <div className="container mx-auto py-10 space-y-8 px-4 md:px-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#2D6A4F]">Supervisor Copilot</h1>
        <p className="text-muted-foreground">Welcome, Dr. Amara Osei</p>
      </div>
      
      <SessionTable sessions={sessions} />
    </div>
  )
}
