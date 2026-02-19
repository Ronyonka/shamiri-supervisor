"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { InsightCardSkeleton } from "./InsightCardSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnalyseButtonProps {
  sessionId: string;
}

export function AnalyseButton({ sessionId }: AnalyseButtonProps) {
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
        // Try to parse error message from JSON
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false); // Only stop loading on error, on success we wait for refresh/redirect visual update or just keep spinner until UI changes? 
      // Actually usually better to stop loading too, but router.refresh might be async. 
      // User says "success: router.refresh() to reload...".
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
                <Button disabled className="w-full sm:w-auto">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analysing Session...
                </Button>
                <InsightCardSkeleton />
            </div>
        ) : (
            <Button onClick={handleAnalyze} className="w-full sm:w-auto bg-[#2D6A4F] hover:bg-[#1e4635]">
                Analyse Session
            </Button>
        )}
    </div>
  );
}
