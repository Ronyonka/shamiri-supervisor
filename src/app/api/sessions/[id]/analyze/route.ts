import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeTranscript } from "@/lib/analyzeTranscript";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // 1. Fetch Session + Transcript + Existing Analysis
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        transcript: true,
        analysis: true,
      },
    });

    // 2. 404 if Not Found
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 3. Return Existing Analysis if Present (Idempotency)
    if (session.analysis) {
      return NextResponse.json(session.analysis);
    }

    // 4. Validate Transcript Existence
    if (!session.transcript || !session.transcript.rawText) {
      return NextResponse.json(
        { error: "Transcript not found for this session" },
        { status: 400 }
      );
    }

    // 5. Call AI Service
    const analysisResult = await analyzeTranscript(session.transcript.rawText);

    // 6. DB Transaction: Save Analysis + Update Session Status
    const savedAnalysis = await prisma.$transaction(async (tx) => {
      // Create AI Analysis Record
      const analysis = await tx.aIAnalysis.create({
        data: {
          sessionId: session.id,
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
      });

      // Determine new session status based on risk flag
      const newStatus =
        analysisResult.risk_flag === "RISK" ? "FLAGGED" : "PROCESSED";

      await tx.session.update({
        where: { id: session.id },
        data: { status: newStatus },
      });

      return analysis;
    });

    return NextResponse.json(savedAnalysis);

  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error during analysis",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
