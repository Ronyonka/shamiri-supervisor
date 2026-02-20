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
      {/* Header Row - Clinical Workspace Style */}
      <div className="bg-[#1e3a2f] py-10 px-8 -mx-6 -mt-6 rounded-t-xl shadow-lg relative overflow-hidden">
        {/* Subtle background pattern/glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="relative z-10 space-y-6">
          <Link href="/dashboard" className="inline-flex items-center text-white/60 hover:text-white transition-colors text-sm font-medium group">
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                      {session.fellow.name}
                  </h1>
                  <div className="flex items-center gap-3 text-white/70 text-lg">
                      <span>{session.group.name}</span>
                      <span className="opacity-30">|</span>
                      <span>
                        {session.date.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                        })}
                      </span>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <StatusBadge status={displayStatus} />
               </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {session.analysis ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">AI Clinical Analysis</h2>
                    <AnalyseButton sessionId={session.id} label="Re-analyse" variant="secondary" />
                </div>
                <InsightCard analysis={session.analysis} />
                <div className="pt-6">
                    <ReviewPanel sessionId={session.id} existingReview={session.reviews[0]} />
                </div>
            </div>
        ) : (
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center space-y-6">
                <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Analysis in Progress</h3>
                    <p className="text-muted-foreground">
                        This session is being processed. Analysis findings will appear here automatically once ready.
                    </p>
                </div>
                {/* Fallback button if auto-analysis hasn't run or failed */}
                {session.transcript ? (
                    <AnalyseButton sessionId={session.id} label="Run Manual Analysis" />
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
