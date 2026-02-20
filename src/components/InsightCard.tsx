import { AIAnalysis, RiskStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  analysis: AIAnalysis;
}

export function InsightCard({ analysis }: InsightCardProps) {
  const isRisk = analysis.riskFlag === "RISK";

  return (
    <Card className="w-full border-l-[6px] border-l-[#2D6A4F] bg-[#f7fdf9] border-[#2D6A4F]/10 shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-[#1e3a2f]">
          <Bot className="h-6 w-6 text-[#2D6A4F]" />
          Session Findings & Quality Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* A. SESSION SUMMARY */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Clinical Summary</h3>
          <p className="text-sm leading-relaxed text-slate-700 font-medium">{analysis.summary}</p>
        </div>

        <Separator className="bg-[#2D6A4F]/10" />

        {/* B. QUALITY SCORES */}
        <div className="space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Performance Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ScoreRow 
                    label="Content Coverage"
                    score={analysis.contentCoverageScore}
                    justification={analysis.contentCoverageJustification}
                    maxScore={3}
                />
                
                <ScoreRow 
                    label="Facilitation Quality"
                    score={analysis.facilitationScore}
                    justification={analysis.facilitationJustification}
                    maxScore={3}
                />

                <ScoreRow 
                    label="Protocol Safety"
                    score={analysis.protocolSafetyScore}
                    justification={analysis.protocolSafetyJustification}
                    maxScore={3}
                />
            </div>
        </div>

        <Separator className="bg-[#2D6A4F]/10" />

        {/* C. RISK FLAG */}
        <div className="pt-2">
            {isRisk ? (
                <Alert variant="destructive" className="border-red-200 bg-red-50/50 text-red-900">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="mb-2 text-lg font-bold text-red-700">Protocol Risk Detected</AlertTitle>
                    <AlertDescription className="space-y-3">
                        <p className="font-semibold text-sm">This session has been flagged for immediate supervisor review.</p>
                        {analysis.riskQuote && (
                             <blockquote className="border-l-4 border-red-200 bg-white/50 p-3 italic text-red-900 rounded-r text-sm">
                                "{analysis.riskQuote}"
                            </blockquote>
                        )}
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="border-emerald-200 bg-emerald-50/50 text-emerald-900">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <AlertTitle className="text-lg font-semibold text-emerald-800">No Risk Signals Detected</AlertTitle>
                    <AlertDescription className="text-sm">
                        The session followed safety protocols with no indicators of self-harm or crisis.
                    </AlertDescription>
                </Alert>
            )}
        </div>

        {/* D. DISCLAIMER */}
        <div className="flex items-center justify-center gap-2 pt-4 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
            <Bot className="h-3 w-3" />
            <span>AI-Assisted Analysis · Verified by Supervisor</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreRow({ label, score, justification, maxScore }: { label: string, score: number, justification: string, maxScore: number }) {
    // Generate pills
    const pills = [];
    for (let i = 1; i <= maxScore; i++) {
        pills.push(
            <div 
                key={i}
                className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    i <= score ? "bg-[#2D6A4F]" : "bg-slate-200"
                )}
            />
        );
    }

    const getScoreLabel = (val: number, type: 'content' | 'facilitation' | 'safety') => {
        const ratings = {
            content: { 1: "Limited", 2: "Partial", 3: "Complete" },
            facilitation: { 1: "Developing", 2: "Proficient", 3: "Exemplary" },
            safety: { 1: "Flagged", 2: "Variance", 3: "Adherent" }
        };
        // @ts-ignore - indexes are safe
        const labelStr = ratings[type][val] || "Unknown";
        return labelStr;
    };

    return (
        <div className="flex flex-col h-full space-y-3">
            <div className="space-y-2">
                <div className="flex items-center justify-between group">
                    <span className="font-bold text-xs text-slate-800 tracking-tight">{label}</span>
                    <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                        {getScoreLabel(score, labelToType(label))}
                    </span>
                </div>
                <div className="flex gap-1.5 w-full">{pills}</div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {justification}
            </p>
        </div>
    );
}

function labelToType(label: string): 'content' | 'facilitation' | 'safety' {
    if (label.includes("Content")) return 'content';
    if (label.includes("Facilitation")) return 'facilitation';
    return 'safety';
}
