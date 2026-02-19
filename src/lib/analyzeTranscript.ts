import { z } from "zod";
import OpenAI from "openai";


// 1. Zod Schema Definition
export const SessionAnalysisSchema = z.object({
  summary: z.string().describe("3 sentences summary of the session"),
  content_coverage: z.object({
    score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rating: z.enum(["Missed", "Partial", "Complete"]),
    justification: z.string().describe("must cite specific transcript evidence"),
  }),
  facilitation_quality: z.object({
    score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rating: z.enum(["Poor", "Adequate", "Excellent"]),
    justification: z.string(),
  }),
  protocol_safety: z.object({
    score: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    rating: z.enum(["Violation", "Minor Drift", "Adherent"]),
    justification: z.string(),
  }),
  risk_flag: z.enum(["SAFE", "RISK"]),
  risk_quote: z.string().nullable().describe("verbatim quote if RISK, null if SAFE"),
});

export type SessionAnalysis = z.infer<typeof SessionAnalysisSchema>;

export class AnalysisError extends Error {
  constructor(public cause: z.ZodError) {
    super("AI response failed schema validation");
    this.name = "AnalysisError";
  }
}

// 2. Analysis Function
export async function analyzeTranscript(transcript: string): Promise<SessionAnalysis> {
  const openai = new OpenAI(); // Initialized inside the function

  const systemPrompt = `You are a quality assurance assistant for Shamiri Institute, a mental health organisation in Kenya.

You are helping Tier 2 Supervisors review sessions run by Shamiri Fellows — lay providers aged 18-22 
who deliver structured group therapy to secondary school students. Fellows are NOT psychiatrists. 
They follow a strict curriculum and must not give medical advice or stray outside the protocol.

SCORING RUBRIC:

Content Coverage — Did the Fellow teach Growth Mindset?
Key phrases to look for: "brain is a muscle", "learning from failure", "effort matters more than talent"
1 (Missed): Fellow did not mention Growth Mindset or defined it incorrectly
2 (Partial): Fellow mentioned it but did not check for understanding
3 (Complete): Fellow explained it clearly, gave an example, and invited group response

Facilitation Quality — How did the Fellow deliver the session?
1 (Poor): Dominated conversation, interrupted students, or used confusing jargon
2 (Adequate): Polite but transactional — stuck to script without genuine engagement
3 (Excellent): Warm, encouraged quiet members, validated feelings, used open-ended questions

Protocol Safety — Did the Fellow stay within lay-provider boundaries?
1 (Violation): Gave medical/relationship advice or significantly strayed off-topic
2 (Minor Drift): Got sidetracked but returned to curriculum
3 (Adherent): Stayed focused on Shamiri curriculum, handled distractions appropriately

RISK DETECTION — CRITICAL:
Flag RISK only for genuine indicators of: self-harm, suicidal ideation, abuse disclosure, or severe crisis.
Do NOT flag for: general sadness, stress about exams, family conflict, or low mood.
If RISK: extract the exact verbatim quote from the transcript that triggered the flag.
If SAFE: risk_quote must be null.

IMPORTANT: Always ground your justifications in specific evidence from the transcript. 
If something is ambiguous, say so in the justification. Do not invent evidence.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_session",
            description: "Analyze the therapy session transcript according to the rubric.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "3 sentences summary" },
                content_coverage: {
                  type: "object",
                  properties: {
                    score: { type: "number", enum: [1, 2, 3] },
                    rating: { type: "string", enum: ["Missed", "Partial", "Complete"] },
                    justification: { type: "string", description: "must cite specific transcript evidence" },
                  },
                  required: ["score", "rating", "justification"],
                },
                facilitation_quality: {
                  type: "object",
                  properties: {
                    score: { type: "number", enum: [1, 2, 3] },
                    rating: { type: "string", enum: ["Poor", "Adequate", "Excellent"] },
                    justification: { type: "string" },
                  },
                  required: ["score", "rating", "justification"],
                },
                protocol_safety: {
                  type: "object",
                  properties: {
                    score: { type: "number", enum: [1, 2, 3] },
                    rating: { type: "string", enum: ["Violation", "Minor Drift", "Adherent"] },
                    justification: { type: "string" },
                  },
                  required: ["score", "rating", "justification"],
                },
                risk_flag: { type: "string", enum: ["SAFE", "RISK"] },
                risk_quote: { type: "string", nullable: true, description: "verbatim quote if RISK, null if SAFE" },
              },
              required: [
                "summary",
                "content_coverage",
                "facilitation_quality",
                "protocol_safety",
                "risk_flag",
                "risk_quote",
              ],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyze_session" } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error("No function tool call returned from OpenAI");
    }

    const args = JSON.parse(toolCall.function.arguments);
    const result = SessionAnalysisSchema.safeParse(args);

    if (!result.success) {
      throw new AnalysisError(result.error);
    }

    return result.data;

  } catch (error) {
    if (error instanceof AnalysisError) {
      throw error;
    }
    // Re-throw other errors (e.g. OpenAI API errors)
    throw error;
  }
}
