"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { InsightCardSkeleton } from "./InsightCardSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnalyseButtonProps {
  sessionId: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function AnalyseButton({ 
  sessionId, 
  label = "Analyse Session", 
  variant = "default" 
}: AnalyseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        let errorMessage = "Analysis failed";
        try {
            const data = await response.json();
            if (data.error) errorMessage = data.error;
        } catch (e) {
            // ignore JSON parse error
        }
        throw new Error(errorMessage);
      }

      router.refresh();
      // Reset loading state after a short delay to allow refresh to manifest
      setTimeout(() => setIsLoading(false), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="flex items-center gap-2">
                    {error}
                    <Button variant="outline" size="sm" onClick={handleAnalyze} className="ml-auto h-7">Retry</Button>
                </AlertDescription>
            </Alert>
        )}

        {isLoading ? (
            <div className="space-y-4">
                <Button disabled variant={variant} className="w-full sm:w-auto">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analysing...
                </Button>
                {/* Only show skeleton if it's the first analysis (not re-analysis) */}
                {label === "Analyse Session" && <InsightCardSkeleton />}
            </div>
        ) : (
            <Button 
                onClick={handleAnalyze} 
                variant={variant}
                className={`w-full sm:w-auto cursor-pointer ${variant === 'default' ? 'bg-[#2D6A4F] hover:bg-[#1e4635]' : ''}`}
            >
                {(variant === "outline" || variant === "secondary" || label === "Re-analyse") && <RefreshCw className="mr-2 h-4 w-4" />}
                {label}
            </Button>
        )}
    </div>
  );
}
