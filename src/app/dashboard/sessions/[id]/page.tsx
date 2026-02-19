import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InsightCard } from "@/components/InsightCard";
import { AnalyseButton } from "@/components/AnalyseButton";
import { ReviewPanel } from "@/components/ReviewPanel";

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
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
             
             <StatusBadge status={session.status} />
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

function StatusBadge({ status }: { status: "PROCESSED" | "FLAGGED" | "SAFE" }) {
    const styles = {
        PROCESSED: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200",
        FLAGGED: "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200",
        SAFE: "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200",
    };

    return (
        <Badge variant="outline" className={`text-base py-1 px-4 ${styles[status]}`}>
            {status}
        </Badge>
    );
}
