import { NextRequest, NextResponse } from "next/server";
import {
  AnalyzeRequestSchema,
  type AnalyzeErrorResponse,
  type DetectionResult,
} from "@/types/detection";
import { analyzeMessage, DetectionServiceError } from "@/lib/detectionService";

// This route calls an external API on every request and must never be
// statically cached or pre-rendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
    const result: DetectionResult = await analyzeMessage(parsed.data.message);
    return NextResponse.json<DetectionResult>(result, { status: 200 });
  } catch (err) {
    if (err instanceof DetectionServiceError) {
      // Upstream (Anthropic) or schema-validation failure — not the caller's fault.
      return NextResponse.json<AnalyzeErrorResponse>(
        { error: err.message },
        { status: 502 }
      );
    }

    console.error("Unexpected /api/analyze error:", err);
    return NextResponse.json<AnalyzeErrorResponse>(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Simple health-check / smoke-test endpoint.
export async function GET() {
  return NextResponse.json(
    { status: "ok", endpoint: "/api/analyze", method: "POST", body: { message: "string" } },
    { status: 200 }
  );
}
