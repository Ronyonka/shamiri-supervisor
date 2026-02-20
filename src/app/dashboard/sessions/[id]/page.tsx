import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { InsightCard } from "@/components/InsightCard";
import { AnalyseButton } from "@/components/AnalyseButton";
import { ReviewPanel } from "@/components/ReviewPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { getDisplayStatus } from "@/lib/sessionStatus";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SessionDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: {
        fellow: true,
        group: true,
        transcript: true,
        analysis: true,
        reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
        },
    }
  });

  if (!session) {
    notFound();
  }

  const displayStatus = getDisplayStatus(session);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Link href="/dashboard" passHref>
        <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Header Row */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {session.fellow.name}
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    {session.group.name} · {session.date.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                    })}
                </p>
             </div>
             
             <StatusBadge status={displayStatus} />
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="min-h-[400px]">
        {session.analysis ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <InsightCard analysis={session.analysis} />
                <ReviewPanel sessionId={session.id} existingReview={session.reviews[0]} />
            </div>
        ) : (
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center space-y-6">
                <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">No Analysis Available</h3>
                    <p className="text-muted-foreground">
                        This session has not been analyzed yet. Run the AI analysis to generate quality scores and risk insights.
                    </p>
                </div>
                {/* Only show analyze button if transcript exists */}
                {session.transcript ? (
                    <AnalyseButton sessionId={session.id} />
                ) : (
                    <div className="text-amber-600 font-medium bg-amber-50 inline-block px-4 py-2 rounded-md">
                        Transcript pending upload
                    </div>
                )}
             </div>
        )}
      </div>
    </div>
  );
}
