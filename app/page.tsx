"use client";

import { useState } from "react";
import type { DetectionResult } from "@/types/detection";

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze message");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Misinformation Detector
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Paste any WhatsApp forward or social media message in any Indian language.
          </p>
        </div>

        <div className="space-y-3">
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type or paste message here..."
            className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none text-sm"
          />

          <button
            onClick={handleVerify}
            disabled={loading || !message.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition shadow-sm"
          >
            {loading ? "Verifying..." : "Verify Message"}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xl text-neutral-900 transition">
            <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 mb-4">
              Analysis Result
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">
                  Detected Language:
                </span>
                <span className="text-neutral-700 font-medium">
                  {result.detected_language}{" "}
                  {result.is_code_mixed ? "(Code-mixed)" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">
                  Risk Level:
                </span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded text-xs tracking-wide ${
                    result.risk_level === "SAFE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {result.risk_level}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">
                  Confidence:
                </span>
                <span className="text-neutral-700 font-medium">
                  {(result.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-neutral-900 block mb-1.5">
                  Reasoning:
                </span>
                <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  {result.reasoning}
                </p>
              </div>
            </div>

            {result.counter_reply && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <h3 className="font-semibold text-emerald-900 text-xs tracking-wider uppercase mb-1.5">
                  WhatsApp Counter Reply ({result.counter_reply.script}):
                </h3>
                <p className="text-emerald-950 font-medium italic text-sm leading-relaxed">
                  &ldquo;{result.counter_reply.text}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}