import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeTranscript } from "@/lib/analyzeTranscript";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const { id: sessionId } = await params;

  try {
    // 1. Fetch transcript
    const transcript = await prisma.transcript.findUnique({
      where: { sessionId },
    });

    if (!transcript) {
      return NextResponse.json({ error: "No transcript found" }, { status: 404 });
    }

    // 2. Perform Analysis
    const analysisResult = await analyzeTranscript(transcript.rawText);

    // 3. Upsert Analysis record
    // We use upsert to allow re-analysis if requested (update existing or create new)
    const analysis = await prisma.aIAnalysis.upsert({
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

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
