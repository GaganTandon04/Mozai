#!/usr/bin/env node
/**
 * Standalone integration test for POST /api/analyze.
 *
 * Usage:
 *   1. Start your Next.js dev server in another terminal: npm run dev
 *   2. Run:  node test-backend.mjs
 *   Optional: BASE_URL=http://localhost:3000 node test-backend.mjs
 *
 * Requires Node 18+ (uses the built-in fetch).
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ENDPOINT = `${BASE_URL}/api/analyze`;

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

const VALID_RISK_LEVELS = [
  "SAFE",
  "MISLEADING",
  "HIGH_RISK_HOAX",
  "FINANCIAL_SCAM",
  "HEALTH_MISINFORMATION",
];

const testCases = [
  {
    name: "Hinglish ₹2000 GPS chip rumor",
    message:
      "Sarkar naye 2000 rupaye ke note mein GPS chUrgent alert: Free laptop scheme announced by PM for all college students. Click this link immediately to register: http://free-laptop-scheme-gov.inip laga rahi hai isliye purane note wapas mangwa rahi hai. Yeh sach hai, mere dost ne bola RBI se suna. Sabko forward karo jaldi!",
    expectRisky: true,
  },
  {
    name: "Tamil script fake health claim",
    message:
      "முக்கிய அறிவிப்பு: தமிழக அரசு பள்ளி மற்றும் கல்லூரி மாணவர்களுக்கு ரூ.25,000 இலவச கல்வி உதவித்தொகை அறிவித்துள்ளது. கடைசி தேதி இன்று மட்டுமே! உடனடியாக உங்கள் ஆதார் எண் மற்றும் வங்கி கணக்கு விவரங்களை பதிவு செய்து தொகையை பெற கீழே உள்ள லிங்கை கிளிக் செய்யவும்: http://tn-kalvi-scholarship-gov.site/applyமுக்கிய அறிவிப்பு: இரவு தூங்குவதற்கு முன் சுடுதண்ணீரில் எலுமிச்சை சாறு மற்றும் சீரகம் குடித்தால் எந்தவித வைரஸ் தொற்றும் வராது, கேன்சர் கூட குணமாகும். தயவுசெய்து உங்கள் குடும்ப குரூப்பில் பகிரவும்.மும் மூன்று வேளையும் வெங்காயம் சாப்பிட்டால் புற்றுநோய் முழுவதுமாக குணமாகிவிடும் என விஞ்ஞானிகள் கண்டுபிடித்துள்ளனர். இதை உடனே எல்லோருக்கும் பகிருங்கள்!",
    expectRisky: true,
  },
  {
    name: "Benign daily message",
    message: "Aaj shaam 5 baje coffee ke liye milte hain kya? Bata dena timing confirm karke.",
    expectRisky: false,
  },
];

function printHeader(text) {
  console.log(`\n${BOLD}${CYAN}${"=".repeat(72)}${RESET}`);
  console.log(`${BOLD}${CYAN}${text}${RESET}`);
  console.log(`${BOLD}${CYAN}${"=".repeat(72)}${RESET}`);
}

function isValidDetectionResult(data) {
  return (
    data &&
    typeof data.detected_language === "string" &&
    typeof data.is_code_mixed === "boolean" &&
    VALID_RISK_LEVELS.includes(data.risk_level) &&
    typeof data.confidence_score === "number" &&
    data.confidence_score >= 0 &&
    data.confidence_score <= 1 &&
    typeof data.reasoning === "string" &&
    data.counter_reply &&
    typeof data.counter_reply.text === "string" &&
    typeof data.counter_reply.script === "string" &&
    typeof data.counter_reply.tone_style === "string" &&
    data.prism_trace &&
    typeof data.prism_trace.latency_ms === "number" &&
    typeof data.prism_trace.model_version === "string" &&
    typeof data.prism_trace.flagged_for_audit === "boolean"
  );
}

function printResult(testCase, data, roundTripMs) {
  console.log(`\n${BOLD}Test:${RESET} ${testCase.name}`);
  console.log(`${BOLD}Input:${RESET} ${testCase.message}`);
  console.log(`  Detected language : ${data.detected_language}`);
  console.log(`  Code-mixed        : ${data.is_code_mixed}`);
  console.log(`  Risk level        : ${data.risk_level}`);
  console.log(`  Confidence        : ${data.confidence_score}`);
  console.log(`  Reasoning         : ${data.reasoning}`);
  console.log(`  Counter-reply     : ${data.counter_reply.text}`);
  console.log(`    script          : ${data.counter_reply.script}`);
  console.log(`    tone_style      : ${data.counter_reply.tone_style}`);
  console.log(
    `  PRISM trace       : latency=${data.prism_trace.latency_ms}ms, model=${data.prism_trace.model_version}, flagged=${data.prism_trace.flagged_for_audit}`
  );
  console.log(`  Round-trip time   : ${roundTripMs}ms`);

  if (testCase.expectRisky && data.risk_level === "SAFE") {
    console.log(`${YELLOW}  ⚠ Warning: expected a risky classification but got SAFE${RESET}`);
  }
  if (!testCase.expectRisky && data.risk_level !== "SAFE") {
    console.log(`${YELLOW}  ⚠ Warning: expected SAFE but got ${data.risk_level}${RESET}`);
  }
}

async function runTest(testCase) {
  const started = Date.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: testCase.message }),
    });
    const roundTripMs = Date.now() - started;

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.log(`\n${BOLD}Test:${RESET} ${testCase.name}`);
      console.log(`${RED}${BOLD}FAILED${RESET} — HTTP ${res.status}: ${JSON.stringify(errBody)}`);
      return false;
    }

    const data = await res.json();
    const valid = isValidDetectionResult(data);

    printResult(testCase, data, roundTripMs);

    if (valid) {
      console.log(`  ${GREEN}${BOLD}PASSED${RESET}`);
    } else {
      console.log(`  ${RED}${BOLD}FAILED${RESET} — response did not match the expected schema`);
    }

    return valid;
  } catch (err) {
    console.log(`\n${BOLD}Test:${RESET} ${testCase.name}`);
    console.log(`${RED}${BOLD}ERROR${RESET} ${err.message}`);
    console.log(
      `${YELLOW}  Is the dev server running at ${BASE_URL}? Try: npm run dev${RESET}`
    );
    return false;
  }
}

async function main() {
  printHeader(`Testing ${ENDPOINT}`);

  let passed = 0;
  for (const testCase of testCases) {
    const ok = await runTest(testCase);
    if (ok) passed++;
  }

  printHeader(`Results: ${passed}/${testCases.length} tests passed`);

  if (passed !== testCases.length) {
    process.exitCode = 1;
  }
}

main();
