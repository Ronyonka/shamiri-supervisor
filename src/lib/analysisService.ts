import prisma from "@/lib/prisma";
import { analyzeTranscript } from "./analyzeTranscript";

export async function runAnalysis(sessionId: string) {
  const transcript = await prisma.transcript.findUnique({
    where: { sessionId },
  });

  if (!transcript) {
    throw new Error("No transcript found");
  }

  const analysisResult = await analyzeTranscript(transcript.rawText);

  // Upsert Analysis record
  // We use upsert to allow re-analysis if requested (update existing or create new)
  return await prisma.aIAnalysis.upsert({
    where: { sessionId },
    create: {
      sessionId,
      summary: analysisResult.summary,
      
      contentCoverageScore: analysisResult.content_coverage.score,
      contentCoverageJustification: analysisResult.content_coverage.justification,
      
      facilitationScore: analysisResult.facilitation_quality.score,
      facilitationJustification: analysisResult.facilitation_quality.justification,
      
      protocolSafetyScore: analysisResult.protocol_safety.score,
      protocolSafetyJustification: analysisResult.protocol_safety.justification,
      
      riskFlag: analysisResult.risk_flag,
      riskQuote: analysisResult.risk_quote,
    },
    update: {
      summary: analysisResult.summary,
      
      contentCoverageScore: analysisResult.content_coverage.score,
      contentCoverageJustification: analysisResult.content_coverage.justification,
      
      facilitationScore: analysisResult.facilitation_quality.score,
      facilitationJustification: analysisResult.facilitation_quality.justification,
      
      protocolSafetyScore: analysisResult.protocol_safety.score,
      protocolSafetyJustification: analysisResult.protocol_safety.justification,
      
      riskFlag: analysisResult.risk_flag,
      riskQuote: analysisResult.risk_quote,
      
      generatedAt: new Date(), // update timestamp on re-analysis
    },
  });
}
