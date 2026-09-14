import { NextRequest, NextResponse } from "next/server";
import {
  AnalyzeRequestSchema,
  type AnalyzeErrorResponse,
  type DetectionResult,
} from "@/types/detection";
import { analyzeMessage, DetectionServiceError } from "@/lib/detectionService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sendToPrism(claim: string, result: DetectionResult, latencyMs: number) {
  const host = process.env.PRISMTRACE_HOST || "https://prism.blockconvey.com";
  const apiKey = process.env.PRISMTRACE_API_KEY;
  const projectId = process.env.PRISMTRACE_PROJECT_ID;

  if (!apiKey || !projectId) return;

  try {
    await fetch(`${host}/api/traces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PRISMtrace-Key": apiKey,
      },
      body: JSON.stringify({
        project_id: projectId,
        model: "llama-3.3-70b-versatile",
        input_messages: [{ role: "user", content: claim }],
        output_message: JSON.stringify(result),
        latency_ms: latencyMs,
        session_id: "mozai-session",
        agent_id: "mozai-detector",
      }),
    });
  } catch (err) {
    console.error("PRISM logging failed:", err);
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const startTime = Date.now();

  try {
    const result: DetectionResult = await analyzeMessage(parsed.data);
    const latencyMs = Date.now() - startTime;

    // Send trace data to PRISM in the background
    sendToPrism(parsed.data.text || "", result, latencyMs);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof DetectionServiceError) {
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: err.message },
        { status: 502 }
      );
    }
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}