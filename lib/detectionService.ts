import Groq from "groq-sdk";
import {
  ClaudeAnalysisSchema,
  DetectionResultSchema,
  type ClaudeAnalysis,
  type DetectionResult,
} from "@/types/detection";

export class DetectionServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DetectionServiceError";
  }
}

const SYSTEM_PROMPT = `You are an expert fact-checking and misinformation detection analyzer for Indian social media and WhatsApp messages across all Indian languages (Hindi, Hinglish, Tamil, Telugu, Bengali, English, etc.).

TEMPORAL & FACTUAL ANCHOR:
- Current Date: September 15, 2026.
- Knowledge Boundaries: Abhishek Sharma is an active Indian cricketer and opener (SRH/India), NOT a retired player from past decades. Scoring 200 runs in a T20I has never occurred. MS Dhoni plays cricket, not football.
- Breaking News & Product Launches: If a message claims or inquires about a brand-new product launch, match outcome, or event from the current week that cannot be verified against established official records or sounds improbable (e.g. ₹3 lakh phone claims or unannounced models), classify accurately and state in the reasoning that official sources or manufacturer press releases should be consulted.

EVALUATION & CLASSIFICATION RULES:
1. "MISLEADING":
   - Fabricated or absurd claims (e.g. sports cross-overs, impossible feats).
   - Events described as completed that have a future date.
   - Distorted match scores, fabricated pricing, or fake quotes.
2. "SAFE":
   - Harmless greetings, authentic verified facts, casual conversation without false factual claims.
3. "FINANCIAL_SCAM":
   - Free recharge claims, lotteries, fake cash reward schemes, phishing links.
4. "HEALTH_MISINFORMATION":
   - Dangerous medical cures, fabricated home remedies for serious illnesses.
5. "HIGH_RISK_HOAX":
   - False alerts inciting communal unrest, violence, or emergency panic.

OUTPUT FORMAT:
Output ONLY a valid JSON object. Do not wrap in markdown code fences (\`\`\`json). Do not add introductory or concluding conversational text.

JSON Schema:
{
  "detected_language": "string",
  "is_code_mixed": boolean,
  "risk_level": "SAFE" | "MISLEADING" | "HIGH_RISK_HOAX" | "FINANCIAL_SCAM" | "HEALTH_MISINFORMATION",
  "confidence_score": number,
  "reasoning": "Clear factual explanation identifying why the claim is misleading or safe without fabricating bios",
  "counter_reply": {
    "text": "friendly correction in the exact language/script of the user",
    "script": "string (e.g. Latin, Devanagari, Tamil)",
    "tone_style": "polite"
  }
}`;

let cachedGroq: Groq | null = null;

function getGroqClient(): Groq {
  if (cachedGroq) return cachedGroq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new DetectionServiceError("GROQ_API_KEY is missing from .env.local");
  }
  cachedGroq = new Groq({ apiKey });
  return cachedGroq;
}

function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export async function analyzeMessage(message: string): Promise<DetectionResult> {
  const groq = getGroqClient();
  const startedAt = Date.now();

  let rawJsonText = "";
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Evaluate the following message for misinformation risk. Output ONLY valid JSON:\n\n"""${message}"""`,
        },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.1,
    });

    rawJsonText = chatCompletion.choices[0]?.message?.content || "{}";
  } catch (err) {
    throw new DetectionServiceError(
      `Groq API error: ${err instanceof Error ? err.message : String(err)}`,
      err
    );
  }

  const latency_ms = Date.now() - startedAt;

  let parsedRaw: unknown;
  try {
    const cleaned = cleanJsonOutput(rawJsonText);
    parsedRaw = JSON.parse(cleaned);
  } catch (err) {
    throw new DetectionServiceError(`Invalid JSON from model: ${rawJsonText}`, err);
  }

  const parsed = ClaudeAnalysisSchema.safeParse(parsedRaw);
  if (!parsed.success) {
    throw new DetectionServiceError(
      `Schema validation failed: ${parsed.error.message}`,
      parsed.error
    );
  }

  const analysis: ClaudeAnalysis = parsed.data;

  const flagged_for_audit =
    analysis.confidence_score < 0.7 || analysis.risk_level === "HIGH_RISK_HOAX";

  return DetectionResultSchema.parse({
    ...analysis,
    prism_trace: {
      latency_ms,
      model_version: "openai/gpt-oss-20b",
      flagged_for_audit,
    },
  });
}