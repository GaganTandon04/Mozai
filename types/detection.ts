import { z } from "zod";

export const AnalyzeRequestSchema = z
  .object({
    text: z.string().optional(),
    message: z.string().optional(),
    claim: z.string().optional(),
    language: z.string().optional(),
  })
  .refine((data) => !!(data.text || data.message || data.claim), {
    message: "Claim text cannot be empty",
  })
  .transform((data) => ({
    text: data.text || data.message || data.claim || "",
    language: data.language,
  }));

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export interface EvidencePoint {
  fact: string;
  status: "CONFIRMED" | "REFUTED" | "CONTESTED";
}

export interface DetectionResult {
  verdict: "VERIFIED_TRUE" | "MISLEADING" | "DEBUNKED_FALSE" | "UNVERIFIABLE";
  confidenceScore: number;
  threatLevel: "LOW" | "MODERATE" | "CRITICAL";
  summary: string;
  claimDecomposition: {
    coreAssertion: string;
    impliedNarrative: string;
  };
  forensicBreakdown: {
    emotionalManipulativeness: "LOW" | "MEDIUM" | "HIGH";
    fallaciesDetected: string[];
    missingContext: string[];
  };
  evidencePoints: EvidencePoint[];
  latencyMs?: number;
}

export interface AnalyzeErrorResponse {
  error: string;
  details?: unknown;
}