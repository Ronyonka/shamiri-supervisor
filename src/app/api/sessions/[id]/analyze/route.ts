import { NextRequest, NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analysisService";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const { id: sessionId } = await params;

  try {
    const analysis = await runAnalysis(sessionId);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis failed:", error);
    
    if (error instanceof Error && error.message === "No transcript found") {
        return NextResponse.json({ error: "No transcript found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
