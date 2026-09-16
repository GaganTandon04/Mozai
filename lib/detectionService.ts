import Groq from "groq-sdk";
import { AnalyzeRequest, DetectionResult } from "@/types/detection";

export class DetectionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DetectionServiceError";
  }
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeMessage(data: AnalyzeRequest): Promise<DetectionResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new DetectionServiceError("GROQ_API_KEY is not configured.");
  }

  const systemPrompt = `
You are MOZAI, an objective, accurate forensic misinformation and fact-checking intelligence engine.

CRITICAL TRUTH & VERIFICATION STANDARDS:
1. ACCURACY FIRST: Never label a historically true, documented, or empirical event as false or misleading. Check your facts carefully before passing judgment (e.g., MS Dhoni famously finished the 2011 World Cup final by hitting a six off Nuwan Kulasekara; this is 100% VERIFIED_TRUE).
2. OBJECTIVITY OVER SKEPTICISM: Do not hunt for rhetorical fallacies or manipulative intent where none exists. If a statement is simply reporting or stating an accurate historical event, sports result, or verifiable fact, assign:
   - verdict: "VERIFIED_TRUE"
   - threatLevel: "LOW"
   - confidenceScore: 95-100
   - fallaciesDetected: []
   - emotionalManipulativeness: "LOW"
3. VERDICT TAXONOMY:
   - VERIFIED_TRUE: Backed by authoritative documentation, empirical evidence, or verified historical records.
   - MISLEADING: Contains accurate elements mixed with false context, selective editing, or altered framing.
   - DEBUNKED_FALSE: Empirically untrue, fabricated, debunked hoax, or contradictory to documented reality.
   - UNVERIFIABLE: Rumors, unannounced future events without credible reporting, or ungrounded claims.

OUTPUT SPECIFICATION:
Return ONLY valid JSON with no markdown formatting or commentary:
{
  "verdict": "VERIFIED_TRUE" | "MISLEADING" | "DEBUNKED_FALSE" | "UNVERIFIABLE",
  "confidenceScore": number (0-100),
  "threatLevel": "LOW" | "MODERATE" | "CRITICAL",
  "summary": string (direct, accurate factual evaluation),
  "claimDecomposition": {
    "coreAssertion": string,
    "impliedNarrative": string
  },
  "forensicBreakdown": {
    "emotionalManipulativeness": "LOW" | "MEDIUM" | "HIGH",
    "fallaciesDetected": string[],
    "missingContext": string[]
  },
  "evidencePoints": [
    {
      "fact": string,
      "status": "CONFIRMED" | "REFUTED" | "CONTESTED"
    }
  ]
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `EXECUTE FACT AUDIT ON INPUT:\n"""\n${data.text}\n"""` 
        },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.0,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new DetectionServiceError("Model returned an empty forensic payload.");
    }

    const parsed: DetectionResult = JSON.parse(content);
    return parsed;
  } catch (err: any) {
    if (err instanceof DetectionServiceError) throw err;
    throw new DetectionServiceError(`Forensic extraction failed: ${err.message}`);
  }
}