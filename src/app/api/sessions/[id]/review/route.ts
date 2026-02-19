
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ReviewDecision, RiskStatus, SessionStatus } from "@/generated/prisma/client";

const reviewSchema = z.object({
  decision: z.nativeEnum(ReviewDecision),
  overrideStatus: z.nativeEnum(RiskStatus).optional(),
  note: z.string().optional(),
}).refine((data) => {
  if (data.decision === "REJECTED") {
    return !!data.overrideStatus && !!data.note && data.note.length >= 10;
  }
  return true;
}, {
  message: "Override status and a note of at least 10 characters are required when rejecting.",
  path: ["note"], // Attach error to note field
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();

    // 1. Validate request body
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { decision, overrideStatus, note } = validation.data;

    // 2. Fetch session and check existence
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { reviews: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 3. Check for existing review
    if (session.reviews.length > 0) {
      return NextResponse.json(
        { error: "Session already reviewed" },
        { status: 409 }
      );
    }

    // 4. Create SupervisorReview
    // We need a supervisor ID. For this implementation, I'll assume a hardcoded one or fetch the first one
    // as per previous context/conversations if auth isn't fully implemented, 
    // OR ideally we should get it from the session context if available.
    // However, looking at the schema, Session has a supervisorId. 
    // The previous prompt instructions implied we are the supervisor for this session?
    // "SupervisorCopilot" implies we are acting as the supervisor.
    // The schema has `SupervisorReview` linking to `Supervisor`. 
    // Since I don't have auth context, and the instructions are to build the API,
    // I will use the supervisorId from the session itself, assuming the logged-in user IS the supervisor of the session.
    
    // WAIT: The schema says `SupervisorReview` has `supervisor Supervisor @relation(...)`. 
    // I need a valid supervisor ID to create the review.
    // The session object has `supervisorId`. I will use that for now.
    
    const review = await prisma.supervisorReview.create({
      data: {
        sessionId,
        supervisorId: session.supervisorId, // Assuming the reviewer is the session's supervisor
        decision,
        overrideStatus,
        note,
      },
    });

    // 5. Update Session status if REJECTED
    if (decision === "REJECTED" && overrideStatus) {
      const newSessionStatus =
        overrideStatus === "SAFE" ? SessionStatus.SAFE : SessionStatus.FLAGGED;
      
      await prisma.session.update({
        where: { id: sessionId },
        data: { status: newSessionStatus },
      });
    }

    // 6. Return updated session info (or just the review)
    // The requirements say "Return the updated session with the new review"
    const updatedSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        reviews: true,
        analysis: true,
        transcript: true, 
        fellow: true,
        group: true
      },
    });

    return NextResponse.json(updatedSession);

  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Review submission failed" },
      { status: 500 }
    );
  }
}
